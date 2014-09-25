/*
 * dominotzc.js
 * Automatically calculate the domino timezone cookie for the user's timezone.
 * Give options to set or remove the cookie, and get current calculated/set
 * timezone or all of the timezone entries.
 *
 * Based on date routines to calculate start and end DST from Andrew Urquhart in 2004.
 */
var dominoTimezone = (function () {
  "use strict";

  /*
   * Global Variables
   */
  var cookieName = "DomTimeZonePrfM",
    multiserver = true, // Set to false if you do not want the cookie to apply to all sub-domains of a domain.
    currentTzPrf,
    tzEntries = [],
    cookie,
    util;

  /*
   * tzEntries array.
   * You must update the tzEntries array from your Domino server if your server is
   * later than 9.01 and the timezone entries have changed. If you have a server
   * below 9.01, leave the tzEntries array as is. The server will correctly calculate
   * the timezone for dates with the later tzEntries array.
   *
   * 2014-09-19 TKO Update tzEntries array from Domino 9.01.
   */

  /* Copyright IBM Corp. 2010, 2012  All Rights Reserved. */
  /*
   * Constructors.
   */

  function tzEntry(sName, sValue, bDst) {
    this.name = sName;
    this.value = sValue;
    this.dst = bDst;
  }

  /* This is the section you have to get from your Domino server if it is a later
   * version that this at:
   *   /$Preferences.nsf?OpenPreferences&amp;PreferenceType=TimeZoneJS
   */
  tzEntries[0] = new tzEntry("(GMT-12:00) International Date Line West", "Dateline:12:0", false);
  tzEntries[1] = new tzEntry("(GMT-11:00) Midway Island, Samoa", "Samoa:11:0", false);
  tzEntries[2] = new tzEntry("(GMT-10:00) Hawaii", "Hawaiian:10:0", false);
  tzEntries[3] = new tzEntry("(GMT-09:00) Alaska", "Alaskan:9:3|2|1|11|1|1", true);
  tzEntries[4] = new tzEntry("(GMT-08:00) Pacific Time (US & Canada)", "Pacific:8:3|2|1|11|1|1", true);
  tzEntries[5] = new tzEntry("(GMT-08:00) Tijuana, Baja California", "Pacific%20Standard%20Time%20%28Mexico%29:8:4|1|1|10|-1|1", true);
  tzEntries[6] = new tzEntry("(GMT-07:00) Mountain Time (US & Canada)", "Mountain:7:3|2|1|11|1|1", true);
  tzEntries[7] = new tzEntry("(GMT-07:00) Chihuahua, La Paz, Mazatlan", "Mountain%20Standard%20Time%20%28Mexico%29:7:4|1|1|10|-1|1", true);
  tzEntries[8] = new tzEntry("(GMT-07:00) Arizona", "US%20Mountain:7:0", false);
  tzEntries[9] = new tzEntry("(GMT-06:00) Saskatchewan", "Canada%20Central:6:0", false);
  tzEntries[10] = new tzEntry("(GMT-06:00) Central America", "Central%20America:6:0", false);
  tzEntries[11] = new tzEntry("(GMT-06:00) Central Time (US & Canada)", "Central:6:3|2|1|11|1|1", true);
  tzEntries[12] = new tzEntry("(GMT-06:00) Guadalajara, Mexico City, Monterrey", "Central%20Standard%20Time%20%28Mexico%29:6:4|1|1|10|-1|1", true);
  tzEntries[13] = new tzEntry("(GMT-05:00) Eastern Time (US & Canada)", "Eastern:5:3|2|1|11|1|1", true);
  tzEntries[14] = new tzEntry("(GMT-05:00) Bogota, Lima, Quito", "SA%20Pacific:5:0", false);
  tzEntries[15] = new tzEntry("(GMT-05:00) Indiana (East)", "US%20Eastern:5:0", false);
  tzEntries[16] = new tzEntry("(GMT-04:30) Caracas", "Venezuela:3004:0", false);
  tzEntries[17] = new tzEntry("(GMT-04:00) Atlantic Time (Canada)", "Atlantic:4:3|2|1|11|1|1", true);
  tzEntries[18] = new tzEntry("(GMT-04:00) Manaus", "Central%20Brazilian:4:10|3|7|2|2|7", true);
  tzEntries[19] = new tzEntry("(GMT-04:00) Santiago", "Pacific%20SA:4:10|2|7|3|2|7", true);
  tzEntries[20] = new tzEntry("(GMT-04:00) Asuncion", "Paraguay:4:10|3|7|3|2|7", true);
  tzEntries[21] = new tzEntry("(GMT-04:00) Georgetown, La Paz, San Juan", "SA%20Western:4:0", false);
  tzEntries[22] = new tzEntry("(GMT-03:30) Newfoundland", "Newfoundland:3003:3|2|1|11|1|1", true);
  tzEntries[23] = new tzEntry("(GMT-03:00) Buenos Aires", "Argentina:3:10|3|7|3|2|7", true);
  tzEntries[24] = new tzEntry("(GMT-03:00) Brasilia", "E.%20South%20America:3:10|3|7|2|2|7", true);
  tzEntries[25] = new tzEntry("(GMT-03:00) Greenland", "Greenland:3:3|-1|7|10|-1|7", true);
  tzEntries[26] = new tzEntry("(GMT-03:00) Montevideo", "Montevideo:3:10|1|1|3|2|1", true);
  tzEntries[27] = new tzEntry("(GMT-03:00) Cayenne", "SA%20Eastern:3:0", false);
  tzEntries[28] = new tzEntry("(GMT-02:00) Mid-Atlantic", "Mid-Atlantic:2:3|-1|1|9|-1|1", true);
  tzEntries[29] = new tzEntry("(GMT-01:00) Azores", "Azores:1:3|-1|1|10|-1|1", true);
  tzEntries[30] = new tzEntry("(GMT-01:00) Cape Verde Is.", "Cape%20Verde:1:0", false);
  tzEntries[31] = new tzEntry("(GMT) Greenwich Mean Time : Dublin, Edinburgh, Lisbon, London", "GMT:0:3|-1|1|10|-1|1", true);
  tzEntries[32] = new tzEntry("(GMT) Monrovia, Reykjavik", "Greenwich:0:0", false);
  tzEntries[33] = new tzEntry("(GMT) Casablanca", "Morocco:0:0", false);
  tzEntries[34] = new tzEntry("(GMT) Coordinated Universal Time", "UTC:0:0", false);
  tzEntries[35] = new tzEntry("(GMT+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague", "Central%20Europe:-1:3|-1|1|10|-1|1", true);
  tzEntries[36] = new tzEntry("(GMT+01:00) Sarajevo, Skopje, Warsaw, Zagreb", "Central%20European:-1:3|-1|1|10|-1|1", true);
  tzEntries[37] = new tzEntry("(GMT+01:00) Brussels, Copenhagen, Madrid, Paris", "Romance:-1:3|-1|1|10|-1|1", true);
  tzEntries[38] = new tzEntry("(GMT+01:00) West Central Africa", "W.%20Central%20Africa:-1:0", false);
  tzEntries[39] = new tzEntry("(GMT+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna", "W.%20Europe:-1:3|-1|1|10|-1|1", true);
  tzEntries[40] = new tzEntry("(GMT+02:00) Minsk", "E.%20Europe:-2:3|-1|1|10|-1|1", true);
  tzEntries[41] = new tzEntry("(GMT+02:00) Cairo", "Egypt:-2:4|-1|5|9|-1|5", true);
  tzEntries[42] = new tzEntry("(GMT+02:00) Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius", "FLE:-2:3|-1|1|10|-1|1", true);
  tzEntries[43] = new tzEntry("(GMT+02:00) Athens, Bucharest, Istanbul", "GTB:-2:3|-1|1|10|-1|1", true);
  tzEntries[44] = new tzEntry("(GMT+02:00) Jerusalem", "Israel:-2:3|-1|6|9|4|1", true);
  tzEntries[45] = new tzEntry("(GMT+02:00) Amman", "Jordan:-2:3|-1|5|10|-1|6", true);
  tzEntries[46] = new tzEntry("(GMT+02:00) Beirut", "Middle%20East:-2:3|-1|1|10|-1|1", true);
  tzEntries[47] = new tzEntry("(GMT+02:00) Windhoek", "Namibia:-2:4|1|1|9|1|1", true);
  tzEntries[48] = new tzEntry("(GMT+02:00) Harare, Pretoria", "South%20Africa:-2:0", false);
  tzEntries[49] = new tzEntry("(GMT+03:00) Kuwait, Riyadh", "Arab:-3:0", false);
  tzEntries[50] = new tzEntry("(GMT+03:00) Baghdad", "Arabic:-3:0", false);
  tzEntries[51] = new tzEntry("(GMT+03:00) Nairobi", "E.%20Africa:-3:0", false);
  tzEntries[52] = new tzEntry("(GMT+03:00) Tbilisi", "Georgian:-3:0", false);
  tzEntries[53] = new tzEntry("(GMT+03:00) Moscow, St. Petersburg, Volgograd", "Russian:-3:3|-1|1|10|-1|1", true);
  tzEntries[54] = new tzEntry("(GMT+03:30) Tehran", "Iran:-3003:3|3|7|9|3|2", true);
  tzEntries[55] = new tzEntry("(GMT+04:00) Abu Dhabi, Muscat", "Arabian:-4:0", false);
  tzEntries[56] = new tzEntry("(GMT+04:00) Baku", "Azerbaijan:-4:3|-1|1|10|-1|1", true);
  tzEntries[57] = new tzEntry("(GMT+04:00) Yerevan", "Caucasus:-4:3|-1|1|10|-1|1", true);
  tzEntries[58] = new tzEntry("(GMT+04:00) Port Louis", "Mauritius:-4:10|-1|1|3|-1|1", true);
  tzEntries[59] = new tzEntry("(GMT+04:30) Kabul", "Afghanistan:-3004:0", false);
  tzEntries[60] = new tzEntry("(GMT+05:00) Ekaterinburg", "Ekaterinburg:-5:3|-1|1|10|-1|1", true);
  tzEntries[61] = new tzEntry("(GMT+05:00) Islamabad, Karachi", "Pakistan:-5:0", false);
  tzEntries[62] = new tzEntry("(GMT+05:00) Tashkent", "West%20Asia:-5:0", false);
  tzEntries[63] = new tzEntry("(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi", "India:-3005:0", false);
  tzEntries[64] = new tzEntry("(GMT+05:30) Sri Jayawardenepura", "Sri%20Lanka:-3005:0", false);
  tzEntries[65] = new tzEntry("(GMT+05:45) Kathmandu", "Nepal:-4505:0", false);
  tzEntries[66] = new tzEntry("(GMT+06:00) Astana, Dhaka", "Central%20Asia:-6:0", false);
  tzEntries[67] = new tzEntry("(GMT+06:00) Almaty, Novosibirsk", "N.%20Central%20Asia:-6:3|-1|1|10|-1|1", true);
  tzEntries[68] = new tzEntry("(GMT+06:30) Yangon (Rangoon)", "Myanmar:-3006:0", false);
  tzEntries[69] = new tzEntry("(GMT+07:00) Krasnoyarsk", "North%20Asia:-7:3|-1|1|10|-1|1", true);
  tzEntries[70] = new tzEntry("(GMT+07:00) Bangkok, Hanoi, Jakarta", "SE%20Asia:-7:0", false);
  tzEntries[71] = new tzEntry("(GMT+08:00) Beijing, Chongqing, Hong Kong, Urumqi", "China:-8:0", false);
  tzEntries[72] = new tzEntry("(GMT+08:00) Irkutsk, Ulaan Bataar", "North%20Asia%20East:-8:3|-1|1|10|-1|1", true);
  tzEntries[73] = new tzEntry("(GMT+08:00) Kuala Lumpur, Singapore", "Singapore:-8:0", false);
  tzEntries[74] = new tzEntry("(GMT+08:00) Taipei", "Taipei:-8:0", false);
  tzEntries[75] = new tzEntry("(GMT+08:00) Perth", "W.%20Australia:-8:10|-1|1|3|-1|1", true);
  tzEntries[76] = new tzEntry("(GMT+09:00) Seoul", "Korea:-9:0", false);
  tzEntries[77] = new tzEntry("(GMT+09:00) Osaka, Sapporo, Tokyo", "Tokyo:-9:0", false);
  tzEntries[78] = new tzEntry("(GMT+09:00) Yakutsk", "Yakutsk:-9:3|-1|1|10|-1|1", true);
  tzEntries[79] = new tzEntry("(GMT+09:30) Darwin", "AUS%20Central:-3009:0", false);
  tzEntries[80] = new tzEntry("(GMT+09:30) Adelaide", "Cen.%20Australia:-3009:10|1|1|4|1|1", true);
  tzEntries[81] = new tzEntry("(GMT+10:00) Canberra, Melbourne, Sydney", "AUS%20Eastern:-10:10|1|1|4|1|1", true);
  tzEntries[82] = new tzEntry("(GMT+10:00) Brisbane", "E.%20Australia:-10:0", false);
  tzEntries[83] = new tzEntry("(GMT+10:00) Hobart", "Tasmania:-10:10|1|1|4|1|1", true);
  tzEntries[84] = new tzEntry("(GMT+10:00) Vladivostok", "Vladivostok:-10:3|-1|1|10|-1|1", true);
  tzEntries[85] = new tzEntry("(GMT+10:00) Guam, Port Moresby", "West%20Pacific:-10:0", false);
  tzEntries[86] = new tzEntry("(GMT+11:00) Magadan, Solomon Is., New Caledonia", "Central%20Pacific:-11:0", false);
  tzEntries[87] = new tzEntry("(GMT+12:00) Fiji, Marshall Is.", "Fiji:-12:0", false);
  tzEntries[88] = new tzEntry("(GMT+12:00) Petropavlovsk-Kamchatsky", "Kamchatka:-12:3|-1|1|10|-1|1", true);
  tzEntries[89] = new tzEntry("(GMT+12:00) Auckland, Wellington", "New%20Zealand:-12:9|-1|1|4|1|1", true);
  tzEntries[90] = new tzEntry("(GMT+13:00) Nuku\'alofa", "Tonga:-13:0", false);

  /*
   * Cookie manipulation
   */
  cookie = (function () {
    function set(name, value, days, path) {
      var date, expires;

      if (days) {
        date = new Date();
        date.setTime(date.getTime() + (days * 864E5));
        expires = "; expires=" + date.toGMTString();
      } else {
        expires = "";
      }

      if (!path) {
        path = "/";
      }

      document.cookie = name + "=" + value + expires + "; path=" + path;
    }

    function get(name) {
      var nameEQ = name + "=", ca = document.cookie.split(';'), i, c;

      for (i = 0; i < ca.length; i++) {
        c = ca[i].trim();
        if (c.indexOf(nameEQ) === 0) {
          return c.substring(nameEQ.length);
        }
      }

      return null;
    }

    function remove(name, path) {
      set(name, "", -1, path);
    }

    return {
      set: set,
      get: get,
      remove: remove
    };
  }());

  /*
   * Utility functions
   */
  util = (function () {
    // Lookup object in array by property value.
    function lookup(array, prop, value) {
      var i, len;

      for (i = 0, len = array.length; i < len; i++) {
        if (array[i][prop] === value) {
          return array[i];
        }
      }
      return null;
    }

    function pad2(n) {
      if (n < 10) {
        return '0' + n;
      }
      return n;
    }

    function prf_isNumStr(str) {
      return (/^(-)?(([1-9]\d{0,2}(\,\d{3})*)|([1-9]\d*)|(0))$/).test(str);
    }

    // IBM function with some cleanup. The returned domain string does not
    // include the sub-domain.
    function prf_getDomainStr() {
      var dname = "",
        dcmps = location.hostname.split("."),
        ncmps = dcmps.length,
        i,
        start_idx;

      if (ncmps === 1 || prf_isNumStr(dcmps[ncmps - 1])) {
        return "";
      }

      if (ncmps > 3 && dcmps[ncmps - 1].length === 2) {
        start_idx = ncmps - 3;
      } else {
        start_idx = ncmps - 2;
      }

      for (i = start_idx; i < ncmps; i++) {
        dname += "." + dcmps[i];
      }

      return dname;
    }

    // Multiple server is assumed. www.ibm.com is returned as *.ibm.com.
    function getTargetHost() {
      var host;

      host = prf_getDomainStr();
      if (host && multiserver) {
        host = "*" + host;
      }

      return host;
    }

    /*
     * Calculate browser timezone
     */
    function getTimezoneString(objInputDate, blnJsDateCompat) {
      var objDate = new Date(objInputDate),
        intDateTZ = objDate.getTimezoneOffset(),
        strDateTZ_sign = (intDateTZ > 0 ? "-" : "+"),
        intDateTZ_hours = Math.floor(Math.abs(intDateTZ) / 60),
        intDateTZ_minutes = Math.abs(intDateTZ_hours - (Math.abs(intDateTZ) / 60)) * 60,
        strDateTZ_normalised = (blnJsDateCompat ? "UTC" : "GMT") + strDateTZ_sign + pad2(intDateTZ_hours) + (blnJsDateCompat ? "" : ":") + pad2(intDateTZ_minutes);
      return strDateTZ_normalised;
    }

    // Between 2 dates, return when DST starts or ends.
    function getDaylightSavingDay(objIterationMin, objIterationMax) {
      var objTestDateOld = new Date(objIterationMin),
        objTestDate = new Date(objIterationMax);

      while (Math.abs(objTestDate.valueOf() - objTestDateOld.valueOf()) > 0) {
        objTestDateOld = objTestDate;
        objTestDate = new Date(objIterationMin.valueOf() + Math.round((objIterationMax.valueOf() - objIterationMin.valueOf()) / 2));
        if (objTestDate.getTimezoneOffset() === objIterationMin.getTimezoneOffset()) {
          objIterationMin = objTestDate;
        } else {
          objIterationMax = objTestDate;
        }
      }

      return objTestDate;
    }

    function getDominoOffset(iOffset) {
      var iBias = iOffset * -1,
        iBiasMinutes = iBias % 60,
        iBiasHours = (iBias - iBiasMinutes) / 60,
        iHours;

      if (iBiasMinutes === 0) {
        return iBiasHours;
      }

      iHours = Math.abs(iBiasHours);
      return iBiasMinutes + pad2(iHours);
    }

    function getInfo() {
      var tzInfo,
        dateNow = new Date(),
        curTimezoneOffset = dateNow.getTimezoneOffset(),
        curYear = dateNow.getFullYear(),
        dateNow_tzstring = getTimezoneString(dateNow, true),
        dateMonth1 = new Date("1 Jan " + curYear + " 00:00:00 " + dateNow_tzstring),
        dateMonth7 = new Date("1 Jul " + curYear + " 00:00:00 " + dateNow_tzstring),
        dateMonth12 = new Date("1 Dec " + curYear + " 00:00:00 " + dateNow_tzstring),
        intTimezoneOffset1 = dateMonth1.getTimezoneOffset(),
        intTimezoneOffset7 = dateMonth7.getTimezoneOffset(),
        bNorthernHemisphere,
        dateDaylightStart,
        dateDaylightEnd,
        intBias,
        intBegDltDayOfWeek,
        intEndDltDayOfWeek,
        intBegDltWeek,
        intEndDltHours,
        intEndDltWeek;

      // No difference means no DST.
      if (intTimezoneOffset1 === intTimezoneOffset7) {
        tzInfo = getDominoOffset(curTimezoneOffset * -1) + ":0";
      } else {
        // Month 1's timezone offset > month 7's offset means northern hemisphere.
        bNorthernHemisphere = intTimezoneOffset1 > intTimezoneOffset7 ? true : false;

        // Calculate boths dates at which clocks change.
        dateDaylightStart = bNorthernHemisphere ? getDaylightSavingDay(dateMonth1, dateMonth7) : getDaylightSavingDay(dateMonth7, dateMonth12);
        dateDaylightEnd = bNorthernHemisphere ? getDaylightSavingDay(dateMonth7, dateMonth12) : getDaylightSavingDay(dateMonth1, dateMonth7);

        // If start-date is after end date then swap displayed results around.
        intBias = bNorthernHemisphere ? intTimezoneOffset1 * -1 : intTimezoneOffset7 * -1;

        // Domino day of week starts at 1.
        intBegDltDayOfWeek = dateDaylightStart.getDay() + 1;
        intEndDltDayOfWeek = dateDaylightEnd.getDay() + 1;
        // Calculate week of the month that DST starts.
        intBegDltWeek = parseInt((dateDaylightStart.getDate() - (dateDaylightStart.getDate() % 7)) / 7, 10) + 1;
        if (dateDaylightStart.getDate() % 7 === 0) {
          intBegDltWeek--;
        }
        if (intBegDltWeek >= 4) {
          intBegDltWeek = -1; // Make it the last week of the month.
        }

        intEndDltHours = dateDaylightEnd.getHours() + 1;
        if (intEndDltHours === 24) {
          intEndDltHours = 0;
        }
        // Calculate week of the month that DST ends.
        intEndDltWeek = parseInt((dateDaylightEnd.getDate() - (dateDaylightEnd.getDate() % 7)) / 7, 10) + 1;
        if (dateDaylightEnd.getDate() % 7 === 0) {
          intEndDltWeek--;
        }
        if (intEndDltHours === 0) {
          intEndDltWeek--;
        }
        if (intEndDltWeek === 0) {
          intEndDltWeek = 7;
        }
        if (intEndDltWeek >= 4) {
          intEndDltWeek = -1; // Make it the last week of the month.
        }
        tzInfo = getDominoOffset(intBias) +
          ":" + (dateDaylightStart.getMonth() + 1) +
          "," + intBegDltWeek +
          "," + intBegDltDayOfWeek +
          "," + (dateDaylightEnd.getMonth() + 1) +
          "," + intEndDltWeek +
          "," + intEndDltDayOfWeek;
      }

      return tzInfo;
    }

    return {
      getDomainStr: prf_getDomainStr,
      getTargetHost: getTargetHost,
      init: getInfo,
      lookup: lookup
    };
  }());

  function init() {
    var i, tzObj;

    // Change , to | for DST entries to support non-IE browsers, or if it isn't delivered correctly.
    for (i = 0; i < tzEntries.length; i++) {
      if (tzEntries[i].dst) {
        tzEntries[i].value = tzEntries[i].value.replace(/,/g, "|");
      }
      tzEntries[i].key = tzEntries[i].value.substr(tzEntries[i].value.indexOf(":") + 1).replace(/\|/g, ",");
    }

    // Calculate time zone and retrieve tzEntry.
    tzObj = util.lookup(tzEntries, "key", util.init());
    currentTzPrf = {
      name: tzObj.name,
      zone: tzObj.value,
      dst: tzObj.dst ? "1" : "0"
    };
  }

  function curCookie() {
    return cookie.get(cookieName);
  }

  function getTzFromCookie() {
    var zone = curCookie(), dst;

    // If a cookie has been set.
    if (zone) {
      // dst is last character of cookie.
      dst = zone.slice(-1);
      // retrieve zone from cookie.
      zone = zone.substring(4, zone.lastIndexOf(":"));
      return {
        name: util.lookup(tzEntries, "value", zone).name,
        zone: zone,
        dst: dst
      };
    }

    // No cookie set, use calculated value.
    return currentTzPrf;
  }

  function get(id) {
    var retVal = null;

    if (id) {
      if (id === 1) {
        retVal = currentTzPrf;
      } else if (id === 2) {
        retVal = getTzFromCookie();
      } else if (/^[0-9]/.test(id)) {
        // starts with a number, must be a key.
        retVal = util.lookup(tzEntries, "key", id);
      } else {
        retVal = util.lookup(tzEntries, "value", id);
      }
      return retVal;
    }

    // No ID given. Return all entries.
    return tzEntries;
  }

  function set(zone, dst) {
    if (util.getTargetHost()) {
      if (typeof dst === "boolean") {
        dst = dst ? "1" : "0";
      }

      currentTzPrf.zone = zone || currentTzPrf.zone;
      currentTzPrf.dst = dst || currentTzPrf.dst;

      // Save the timezone cookie for 10 years. The saved cookie will be applied
      // to all sub-domains of the domain. If you want it to only apply to a single
      // sub-domain, remove the domain.
      cookie.set(cookieName, "+:6:" + currentTzPrf.zone + ":" + currentTzPrf.dst, 3650, multiserver ? util.getDomainStr() : "");
    } else {
      console.log("Invalid host (", util.getTargetHost(), "), unable to save cookie.");
    }
  }

  function remove() {
    cookie.remove(cookieName, multiserver ? util.getDomainStr() : "");
  }

  function domain() {
    if (multiserver) {
      return util.getTargetHost();
    }
    return location.hostname;
  }

  init();

  return {
    cookie: curCookie,
    domain: domain,
    get: get,
    set: set,
    remove: remove
  };
}());

// dominoTimezone.set();
