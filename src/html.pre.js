/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

/**
 * The 'pre' function that is executed before the HTML is rendered
 * @param payload The current payload of processing pipeline
 * @param payload.content The content
 */

var toHAST = require('mdast-util-to-hast');
var toHTML = require('hast-util-to-html');

function wrap(document, selector, classname) {
  var elems=document.querySelectorAll(selector);
  var div = document.createElement("div");
  div.className=classname;
  for (var i=0;i<elems.length;i++) {
    var el=elems[i];
    div.appendChild(el.cloneNode(true));
    if (i==0) {
      el.parentNode.removeChild(el);
    } else {
      el.parentNode.replaceChild(div, el);
    }
  }
}
  
function classify(document, selector, classname, level) {
  var elems=document.querySelectorAll(selector);
  for (var i=0; i<elems.length; i++) {
    var el=elems[i];
    var l=level;
    while (l) { 
      el=el.parentNode;
      l--;
    }
    el.className = classname;
  }
}
  

function pre(payload) {
  var doc="";

  /* workaround until sections in document are fixed */
  for (var i=0;i<payload.content.sections.length;i++) {
    var sec=payload.content.sections[i];
    sec.innerHTML = toHTML(toHAST(sec));
    doc+="<section>"+sec.innerHTML+"</section>";
  }

  /* shouldn't have to go through body? */
  payload.content.document.body.innerHTML = doc;
  
  var document=payload.content.document;
  classify(document, "section", "copy");
  classify(document, "section p img", "image", 2);
  
  /* header image? */
  if (document.querySelector("section:first-child p img")) {
    classify(document, "section:first-child", "title");
    wrap(document, "section:first-child :nth-child(1n+2)", "header");  
  }

  payload.content.time = `${new Date()}`;
}


module.exports.pre = pre;
