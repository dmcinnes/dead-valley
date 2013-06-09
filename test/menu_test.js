describe("menu", function() {

  beforeEach(function () {
    $('.back').click();
  });

  describe("stats", function() {
    it("clicking stats opens the stats screen", function() {
      $('#stats').click();
      expect($('#main-screen')).toBeHidden();
      expect($('#stats-screen')).toBeVisible();
    });

    it("clicking back goes back to the main screen", function() {
      $('#stats').click();
      $('#stats-screen .back').click();
      expect($('#main-screen')).toBeVisible();
      expect($('#stats-screen')).toBeHidden();
    });
  });

  describe("about", function() {
    it("clicking about opens the about screen", function() {
      $('#about').click();
      expect($('#main-screen')).toBeHidden();
      expect($('#about-screen')).toBeVisible();
    });

    it("clicking back goes back to the main screen", function() {
      $('#about').click();
      $('#about-screen .back').click();
      expect($('#main-screen')).toBeVisible();
      expect($('#about-screen')).toBeHidden();
    });
  });

  describe("instructions", function() {
    it("clicking instructions opens the help screen", function() {
      $('#instructions').click();
      expect($('#main-screen')).toBeHidden();
      expect($('#help')).toBeVisible();
    });

    it("clicking back goes back to the main screen", function() {
      $('#instructions').click();
      $('#help .back').click();
      expect($('#main-screen')).toBeVisible();
      expect($('#help')).toBeHidden();
    });
  });

  describe("new game", function() {
    beforeEach(function () {
      startNewGame();
    });

    it("shows the intro screen when 'new game' is clicked", function() {
      runs(function () {
        expect($('#main-screen')).toBeHidden();
        expect($('#intro-screen')).toBeVisible();
      });
    });

    it("dismisses the intro screen with a click", function() {
      runs(function () {
        expect($('#intro-screen')).toBeVisible();
        $('#intro-screen').click();
        expect($('#intro-screen')).toBeHidden();
      });
    });
  });

});
