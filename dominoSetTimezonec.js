/*global $, dominoTimezone */
$(document).ready(function () {
  'use strict';

  var i,
    zone = $("#tz_zone"),
    dst = $('input:radio[name=tz_dst]'),
    domain = dominoTimezone.domain(),
    browserTzPrf = dominoTimezone.get(1),
    currentTzPrf = dominoTimezone.get(2),
    tzEntries = dominoTimezone.get();

  if (navigator.platform && navigator.platform.indexOf("Win") !== -1) {
    // windows shows fonts a little too light, this will allow us to bump up the font a little.
    $("body").addClass("win");
  }

  $("#browser-timezone").text(browserTzPrf.name);

  // Initialize timezone dropdown.
  for (i = 0; i < tzEntries.length; i++) {
    zone.append('<option value="' + tzEntries[i].value + '">' + tzEntries[i].name + '</option>');
  }

  // Set the timezone selected option to the current timezone preferences.
  zone.val(currentTzPrf.zone);
  // Change the DST radio button when the user selects a different timezone.
  zone.on("change", function () {
    i = zone.find("option:selected").index();
    // Set DST radio button.
    dst.val([tzEntries[i].dst ? "1" : "0"]);
  });

  // Initialize DST radio button.
  dst.val([currentTzPrf.dst]);

  // Display cookie domain.
  if (domain) {
    $("#domain").text($("#domain").text() + domain);
  } else {
    // Not a valid domain, display error message and disable save button.
    $("#domain").text("Please specify a proper DNS host name in the URL.").parent().addClass("text-danger");
    $("#tz_submit").attr("disabled", true);
  }

  // When switching to the Custom tab put focus on the timezone select element.
  $("#custom-tab").on("click", function () {
    // Use timeout to allow tab to appear.
    setTimeout(function () {
      zone.focus();
    }, 400);
  });

  $("#tz_form").on("submit", function (event) {
    var activeTab = $(".nav-tabs").find(".active").data("value");

    event.preventDefault();
    console.log("activeTab:", activeTab);
    switch (activeTab) {
    case 0:
      dominoTimezone.set(browserTzPrf.zone, browserTzPrf.dst);
      zone.val(browserTzPrf.zone);
      dst.val([browserTzPrf.dst]);
      break;

    case 1:
      i = zone.find("option:selected").index();
      dominoTimezone.set(tzEntries[i].value, $('input:radio[name=tz_dst]:checked').val());
      break;

    case 2:
      dominoTimezone.remove();
      break;
    }

    console.log(document.cookie);
    return false;
  });
});
