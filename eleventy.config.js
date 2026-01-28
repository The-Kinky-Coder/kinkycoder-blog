// eleventy.config.js
// Import markdown-it and the attributes plugin
const markdownIt = require("markdown-it");
const markdownItAttrs = require("markdown-it-attrs"); // Ensure this matches the package name

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

  // Date filter for blog posts
  eleventyConfig.addFilter("readableDate", dateObj => {
    return new Date(dateObj).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  });

  // Create a custom collection for posts to ensure the home page updates when posts change
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/posts/**/*.md");
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