# dominotzc.js

Automatically calculate the domino timezone cookie for the user's timezone or get, set, or remove timezone info.

At a previous job I programmed web applications on a IBM Domino server. I needed to display dates and times in the user's timezone. By default the Domino server will use the server timezone to display dates and times on the web. You can have the user go to a preferences website at server-domain//$Preferences.nsf. This will allow users to set their timezone and regional preferences. I believe that the Domino preferences website was written in 2002 using the technology available from 1998. It is a website that uses frames, tables, and many JavaScript functions that pollute the global namespace. Not exactly pretty.

I needed a method to automatically set the user's timezone based on the browser settings. I borrowed a few date calculation functions written in 2004 by [Andrew Urquhart](http://andrewu.co.uk/clj/timezone/) that enabled the program to calculate a key based on when DST started and ended, and the timezone offset from UTC time and local time. With this calculated key the program could lookup the user's timezone in the Domino Timezone Entries array and using Domino functions, set the Domino Timezone cookie. This still left the problem of Domino JavaScript functions poluting the global namespace. It was dirty, but it worked.

A refactoring of the code allows the Domino Timezone Entries array (tzEntries) and needed Domnino functions to be put in a private name space. The new code allows you to set the cookie to a calculated value or create your own preference form to set the cookie.

## Usage

    <script src="path/to/dominotzc.js"></script>

## Syntax
### dominoTimezone.get([id | key | value])

**none**

Returns the tzEntries array.

**id**

Number. 1 for the calculated modified tzEntry object. 2 for the modified cookie tzEntry object.

**key**

String. tzEntry object for key of timezone.

**value**

String tzEntry object for timezone value.

### dominoTimezone.set([zone, dst])

**none**

Set the Domino timezone cookie to the calculated browser value.

**zone**

String. tzEntry object value property.

**dst**

String. "0" for no Daylight Savings Time observed. "1" for Daylight Savings Time observed. May be set manually or retrieved from the tzEntry object dst property.

### dominoTimezone.remove()

Removes the Domino Timezone cookie.

### dominoTimezone.cookie()

Returns the current cookie tzEntry object or if the cookie is not defined, returns the calculated tzEntry object.

## Objects
### tzEntry

```javascript
{
  name: "name of timezone",
  value: "cookie value of timezone",
  dst: true if observed, otherwise false
}
```

### modified tzEntry

```javascript
{
  name: tzEntry.name,
  zone: tzEntry.value,
  dst: "1" if tzEntry.dst === true, otherwise "0"
}
```

## Sample
### dominoSetTimezonec.html

Sample Bootstrap html UI to set and remove the Domino Timezone cookie.

### dominoSetTimezonec.js

Support routines for dominoSetTimezonec.html.

## Notes

If you want the file to just set the Domino Timezone cookie from the browser's calculated value, uncomment the last line in the dominotzc.js file or from your JavaScript code, call:

```javascript
dominoTimezone.set();
```

The code in dominotzc.js does not set regional preferences such as the formatting of date and time, or number and currency. I will work on this in the future in another repository.

## Browser Support

Tested in the latest versions of Chrome, Firefox, Safari, IE 5.5 - 11, iOS, and Android.

## Issues

Have a bug? Please create an [issue](https://github.com/tannyo/dominotzc.js/issues) here on GitHub!

## Contributing

Want to contribute? Great! Just fork the project, make your changes and open a [pull request](https://github.com/tannyo/dominotzc.js/pulls).

## Changelog
* v0.10 24 Sep 2014 TKO Created by Tanny O'Haley

## License

The MIT License (MIT)

Copyright (c) 2014 [Tanny O'Haley](http://tanny.ica.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
