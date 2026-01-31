// eleventy.config.js
// Import markdown-it and the attributes plugin
const markdownIt = require("markdown-it");
const markdownItAttrs = require("markdown-it-attrs"); // Ensure this matches the package name
const path = require("path");
// At the top with your other requires
const beautify = require('js-beautify').html;
const Image = require("@11ty/eleventy-img");

module.exports = function (eleventyConfig) {
  // Configure Markdown-it with the attributes plugin
  let options = {
    html: true, // Allows HTML tags in markdown
    breaks: true,
    linkify: true
  };

  let markdownLib = markdownIt(options).use(markdownItAttrs);

  // Tell Eleventy to use this specific library instance
  eleventyConfig.setLibrary("md", markdownLib);

  // Copy static assets
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/audio");
  eleventyConfig.addPassthroughCopy("src/posts/**/*.{jpg,jpeg,png,gif,svg,webp}");
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  eleventyConfig.addPassthroughCopy("src/CNAME");

  // Add watch targets for CSS and post assets
  eleventyConfig.addWatchTarget("src/css/");
  eleventyConfig.addWatchTarget("src/posts/");

  // Custom image shortcode
  eleventyConfig.addShortcode("image", function (src, alt, width) {
    return `<img src="${src}" alt="${alt}" ${width ? `width="${width}"` : ''} loading="lazy">`;
  });

  // Optimized image shortcode with feature flag
  eleventyConfig.addShortcode("optimizedImage", async function (src, alt, sizes = "100vw") {
    if (!this.ctx.site.enableImageOptimization) {
      // Serve original for A/B testing
      return `<img src="${src}" alt="${alt}" loading="lazy" style="width: 100%; height: auto;">`;
    }
    let metadata = await Image(src, {
      widths: [300, 600, 900],
      formats: ["webp", "jpeg"],
      outputDir: "_site/img/",
      urlPath: "/img/"
    });
    let imageAttributes = {
      alt,
      sizes,
      loading: "lazy",
      decoding: "async",
    };
    return Image.generateHTML(metadata, imageAttributes);
  });

  // custom quote shortcode
  eleventyConfig.addPairedShortcode("quote", function(content) {
    return `<blockquote>${content}</blockquote>`;
  });

  // Add this with your other filters
  eleventyConfig.addFilter("isoDate", dateObj => {
    return new Date(dateObj).toISOString();
  });

  // Date filter for blog posts
  eleventyConfig.addFilter("readableDate", dateObj => {
    return new Date(dateObj).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  });

  // Concat filter for arrays
  eleventyConfig.addFilter("concat", (...arrays) => arrays.flat());

  // Create a custom collection for posts to ensure the home page updates when posts change
  eleventyConfig.addCollection("posts", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/posts/**/*.md");
  });

  // Watch the shortcodes directory for changes
  eleventyConfig.addWatchTarget("./src/_includes/shortcodes/");

  // Audio player shortcode with dynamic require for hot reloading
  eleventyConfig.addShortcode("audio", function (url) {
    const shortcodePath = path.resolve(__dirname, "src/_includes/shortcodes/audio.js");
    delete require.cache[shortcodePath];
    const audioShortcode = require(shortcodePath);
    return audioShortcode(url);
  });

  // Inside module.exports function, add this transform:
  eleventyConfig.addTransform("beautify", function (content, outputPath) {
    if (outputPath && outputPath.endsWith(".html")) {
      return beautify(content, {
        indent_size: 2,
        indent_char: " ",
        max_preserve_newlines: 1,
        preserve_newlines: true,
        end_with_newline: true,
        wrap_line_length: 0,
        indent_inner_html: true,
        unformatted: ['code', 'pre'],  // Removed 'script' from here!
        content_unformatted: ['code', 'pre'],
        indent_scripts: "normal"  // Added this!
      });
    }
    return content;
  });

  return {
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_layouts"
    }
  };
};