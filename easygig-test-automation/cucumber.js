export default {
  default: {
    paths: ['features/*.feature'],
    import: [
      './dist/src/steps/auth.steps.js',
      './dist/src/steps/slots.steps.js',
      './dist/src/steps/bookings.steps.js',
      './dist/src/steps/ui.steps.js'
    ],
    format: [
      'summary',
      'progress-bar',
      'allure-cucumberjs/reporter:allure-results'
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    }
  }
};
