require.config({
  deps: ['Main'],
  baseUrl: "lib",
  urlArgs: "cb=" + (window.DV && window.DV.version)
});
