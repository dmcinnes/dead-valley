describe("menu", function() {

  beforeEach(function () {
    jasmine.Clock.useMock();
    $('.back').click();
  });

  describe("stats", function() {
    it("clicking stats opens the stats screen", function() {
      $('#stats').click();
      $('*').stop(true, true);
      expect($('#main-screen')).toBeHidden();
      expect($('#stats-screen')).toBeVisible();
    });

    it("clicking back goes back to the main screen", function() {
      $('#stats').click();
      $('*').stop(true, true);
      $('#stats-screen .back').click();
      $('*').stop(true, true);
      expect($('#main-screen')).toBeVisible();
      expect($('#stats-screen')).toBeHidden();
    });
  });

  describe("about", function() {
    it("clicking about opens the about screen", function() {
      $('#about').click();
      $('*').stop(true, true);
      expect($('#main-screen')).toBeHidden();
      expect($('#about-screen')).toBeVisible();
    });

    it("clicking back goes back to the main screen", function() {
      $('#about').click();
      $('*').stop(true, true);
      $('#about-screen .back').click();
      $('*').stop(true, true);
      expect($('#main-screen')).toBeVisible();
      expect($('#about-screen')).toBeHidden();
    });
  });

  describe("instructions", function() {
    it("clicking instructions opens the help screen", function() {
      $('#instructions').click();
      $('*').stop(true, true);
      expect($('#main-screen')).toBeHidden();
      expect($('#help')).toBeVisible();
    });

    it("clicking back goes back to the main screen", function() {
      $('#instructions').click();
      $('*').stop(true, true);
      $('#help .back').click();
      $('*').stop(true, true);
      expect($('#main-screen')).toBeVisible();
      expect($('#help')).toBeHidden();
    });
  });

});
