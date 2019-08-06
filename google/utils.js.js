function toHexString(a) {
  return a.map(function(chr){return (chr+256).toString(16).slice(-2)})
  .join('');
}

function getDocId(path) {
  // try to lookup path from lookup table
  var scriptProperties = PropertiesService.getScriptProperties();
  var lookup = scriptProperties.getProperty('pathLookup.json');
  if (lookup) {
    lookup = JSON.parse(lookup);
  } else {
    lookup = {};
  }
  var id = lookup[path];
  if (id) {
    return id;
  }
  
  // search id in drive
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
  if (!files.hasNext()) {
      throw error("Not Found: "+path, 404);
  }
    
  var file=files.next();
  var id=file.getId();
  
  // save id in lookup table
  lookup[path] = id;
  scriptProperties.setProperty('pathLookup.json', JSON.stringify(lookup));
  return id;
}
