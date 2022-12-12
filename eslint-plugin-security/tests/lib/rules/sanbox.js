/**
 * @fileoverview Adds sandbox attribute to iframes
 * @author Rares
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/sanbox"),
  RuleTester = require("../../../lib/testers/rule-tester");


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester();
ruleTester.run("sanbox", rule, {
  valid: [
    // give me some code that won't trigger a warning
  ],

  invalid: [
    {
      code: "When iframe is missing sandbox attribute",
      errors: [{ message: "Fill me in.", type: "Me too" }],
    },
  ],
});
