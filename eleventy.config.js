// eleventy.config.js
module.exports = function (eleventyConfig) {
  // Copy static assets
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/posts/**/*.{jpg,jpeg,png,gif,svg,webp}");
  eleventyConfig.addPassthroughCopy("src/robots.txt");

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