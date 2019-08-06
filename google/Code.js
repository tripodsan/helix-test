function test () {
  try {
    var md=toMarkdown("mytest/tesst");
    Logger.log(md);
  } catch (e) {
    Logger.log(e);
  }
}

function error(msg, code) {
  var e = new Error(msg);
  e.statusCode = code;
  return e;
}

function doGet (req) {
  try {
    console.log('-------------start 13-----------');
    for (var p in req) {
      console.log(p, req[p]);
    }
    console.log(req.pathInfo);

    var path=req.parameter["path"] || req.pathInfo;
    console.log('generating markdown for: ' + path);
    if (!path) {
      throw error('no path', 404);
    }

    var md=toMarkdown(path);

    var json=JSON.stringify({
      "statusCode": 200, 
      "headers": {
        'content-type': 'text/plain',
      },
      "body": md 
    });
    return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);

  } catch(e) {
    // oops something went wrong
    var json=JSON.stringify({
      "statusCode": e.statusCode || 500, 
      "body": e.message,
    });
    return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
  }
}

function toHexString(byteArray) {
  return Array.from(byteArray, function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('')
}

function saveInlineImage(image) {

  var imageBlob=image.getBlob();
  var contentType = imageBlob.getContentType();
  var ext = "";
  if (/\/png$/.test(contentType)) {
    ext = ".png";
  } else if (/\/gif$/.test(contentType)) {
    ext = ".gif";
  } else if (/\/jpe?g$/.test(contentType)) {
    ext = ".jpg";
  } else {
    throw "Unsupported image type: "+contentType;
  }

  var md5 = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, imageBlob.getBytes());
  var md5hex = md5.reduce(function(str,chr){
    chr = (chr < 0 ? chr + 256 : chr).toString(16);
    return str + (chr.length==1?'0':'') + chr;
  },'');

  var name = md5hex + ext;


  var url=storeImage(imageBlob, name);

  var alt=image.getAltTitle();
  if (!alt) alt="";

  return ('!['+alt+']('+url+')');
}


function storeImage(imageBlob, name) {
  var params = {
    method: "PUT",
    payload: imageBlob,
    headers: {
      "x-ms-date": new Date().toString(),
      "x-ms-blob-type": "BlockBlob"
    },
    contentType: imageBlob.getContentType(),
    muteHttpExceptions: true //get error content in the response
  }

  var scriptProperties = PropertiesService.getScriptProperties();
  var sas = scriptProperties.getProperty('AZURE_BLOB_SAS');
  var url="https://helixblobs.blob.core.windows.net/helixcontentblobs/"+name;
  var response = UrlFetchApp.fetch(url+sas, params);

  Logger.log(response);
  return (url);
}

function getDocId(path) {
  var root = DriveApp.getRootFolder();
  var iter = root.getFoldersByName("helix-content");
  if (!iter.hasNext()) {
    throw error('Not found: helix-content', 500);
  }
  var helixContent = iter.next();
  var segments = path.split("/");
  var folder = helixContent;
  for (var i=0; i < segments.length - 1; i++) {
    var seg = segments[i];
    if (!seg) {
      continue;
    }
    var folders=folder.getFoldersByName(seg);
    if (folders.hasNext()) {
      folder=folders.next();
    } else {
      throw error("Not Found: "+path, 404);
    }
  }

  var files=folder.getFilesByName(segments[segments.length-1]);
  if (files.hasNext()) {
    var file=files.next();
    var id=file.getId();
    return id;
    } else {
      throw error("Not Found: "+path, 404);
    }
  }

function processText(inSrc, txt) {
  /* needs to be rewritten as lifted from https://github.com/mangini/gdocs2md */
  if (typeof(txt) === 'string') {
    return txt;
  }

  var pOut = txt.getText();
  if (! txt.getTextAttributeIndices) {
    return pOut;
  }

  var attrs=txt.getTextAttributeIndices();
  var lastOff=pOut.length;

  for (var i=attrs.length-1; i>=0; i--) {
    var off=attrs[i];
    var url=txt.getLinkUrl(off);
    var font=txt.getFontFamily(off);
    if (url) {  // start of link
      if (i>=1 && attrs[i-1]==off-1 && txt.getLinkUrl(attrs[i-1])===url) {
        // detect links that are in multiple pieces because of errors on formatting:
        i-=1;
        off=attrs[i];
        url=txt.getLinkUrl(off);
      }
      pOut=pOut.substring(0, off)+'['+pOut.substring(off, lastOff)+']('+url+')'+pOut.substring(lastOff);
    } else if (font) {
      if (!inSrc && font===font.COURIER_NEW) {
        while (i>=1 && txt.getFontFamily(attrs[i-1]) && txt.getFontFamily(attrs[i-1])===font.COURIER_NEW) {
          // detect fonts that are in multiple pieces because of errors on formatting:
          i-=1;
          off=attrs[i];
        }
        pOut=pOut.substring(0, off)+'`'+pOut.substring(off, lastOff)+'`'+pOut.substring(lastOff);
      }
    }
    if (txt.isBold(off)) {
      var d1 = d2 = "**";
      if (txt.isItalic(off)) {
        // edbacher: changed this to handle bold italic properly.
        d1 = "**_"; d2 = "_**";
      }
      pOut=pOut.substring(0, off)+d1+pOut.substring(off, lastOff)+d2+pOut.substring(lastOff);
    } else if (txt.isItalic(off)) {
      pOut=pOut.substring(0, off)+'*'+pOut.substring(off, lastOff)+'*'+pOut.substring(lastOff);
    }
    lastOff=off;
  }
  return pOut;
}

function toMarkdown (path) {

    var doc = DocumentApp.openById(getDocId(path));
    var body = doc.getBody();

    var result = "";
    var listNumbering = {};

    var elements = body.getNumChildren();
    for( var i=0;i<elements;i++) {
      var el = body.getChild(i);

      /* paragraphs */
      if (el.getType()==DocumentApp.ElementType.PARAGRAPH) {
        var par=el.asParagraph();
        var md="";
        var hpf="";

        switch (par.getHeading()) {
          case DocumentApp.ParagraphHeading.HEADING5: hpf+="#";
          case DocumentApp.ParagraphHeading.HEADING4: hpf+="#";
          case DocumentApp.ParagraphHeading.HEADING3: hpf+="#";
          case DocumentApp.ParagraphHeading.HEADING2: hpf+="#";
          case DocumentApp.ParagraphHeading.HEADING1: hpf+="#";
          default:
            if (hpf) {
              md=hpf+" "+par.getText();
            } else {
              md=processText(false, el.asText())+"\n";
            }
        }

        var numParChildren = el.getNumChildren();
        for( var j=0;j<numParChildren;j++) {
          var pc=el.getChild(j);
          /* horizonal rule */
          if (pc.getType()==DocumentApp.ElementType.HORIZONTAL_RULE) {
            md+="\n---\n";
          }

          /* inline image */
          if (pc.getType()==DocumentApp.ElementType.INLINE_IMAGE) {
            md+=saveInlineImage(pc.asInlineImage());
          }
        }
        result+=md+"\n";
      }

      /* lists */
      if (el.getType()==DocumentApp.ElementType.LIST_ITEM) {
        var prefix="";
        var nesting = el.getNestingLevel();
        for (var j=0; j<nesting; j++) {
          prefix += "    ";
        }

        var gt = el.getGlyphType();

        // unordered
        if (gt === DocumentApp.GlyphType.BULLET
            || gt === DocumentApp.GlyphType.HOLLOW_BULLET
            || gt === DocumentApp.GlyphType.SQUARE_BULLET) {
          prefix += "* ";

        } else {

         // ordered
          var key = el.getListId() + '.' + el.getNestingLevel();
          var counter = listNumbering[key] || 0;
          counter++;
          listNumbering[key] = counter;
          prefix += counter+". ";
        }
        result+=prefix+=processText(false, el.asText())+"\n";
      }

    }
  return (result);
}

