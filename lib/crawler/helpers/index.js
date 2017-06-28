/*
 Control Chrome Headless  Copyright (C) 2017  John Berlin <n0tan3rd@gmail.com>

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Control Chrome Headless is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this Control Chrome Headless.  If not, see <http://www.gnu.org/licenses/>
 */


/**
 * @desc Make sure that the page being crawled can not
 * create alerts, confirm or prompts.
 * Also ensures window.onbeforeunload and window.onunload
 * can not be set.
 * @param win
 */
function killAllJsAlertPromptConfirm (win) {
  Object.defineProperty(win, 'onbeforeunload', {
    configurable: false,
    writeable: false,
    value: function () {}
  })
  Object.defineProperty(win, 'onunload', {
    configurable: false,
    writeable: false,
    value: function () {}
  })
  window.alert = function () {}
  window.confirm = function () {}
  window.prompt = function () {}
  win.alert = function () {}
  win.confirm = function () {}
  win.prompt = function () {}
}

/**
 * @desc For each <a href="..."> make outlink: href l a/@href
 * @return {string}
 */
function getMeOutLinks () {
  return Array.from(document.links).map(it => `outlink: ${it.href} L a/@href\r\n`).join('')
}

/**
 * @desc Retrieves the href values of all </a> in the document
 * @return {string[]}
 */
function getMeNewSeeds () {
  return Array.from(document.links).map(it => it.href)
}

/**
 * @desc Object used by Runtime.evaluate to retrieve outlink metadata
 * @type {{expression: string, includeCommandLineAPI: boolean, generatePreview: boolean, returnByValue: boolean}}
 */
const pageEval = {
  expression: `(${getMeOutLinks.toString()})()`,
  includeCommandLineAPI: true,
  generatePreview: true,
  returnByValue: true
}

/**
 * @desc Object used by Runtime.evaluate to retrieve the new seeds
 * @type {{expression: string, includeCommandLineAPI: boolean, generatePreview: boolean, returnByValue: boolean}}
 */
const newSeeds = {
  expression: `(${getMeNewSeeds.toString()})()`,
  includeCommandLineAPI: true,
  generatePreview: true,
  returnByValue: true
}

/**
 * @desc Object used by Runtime.evaluate to make sure the page can not do naughty
 * things with its JS to keep the crawler from navigating away
 * @type {{scriptSource: string}}
 */
const noNaughtyJs = {
  scriptSource: `(${killAllJsAlertPromptConfirm.toString()})(window);`
}

module.exports = {
  pageEval,
  newSeeds,
  noNaughtyJs
}
