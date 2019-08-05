/*
 * Copyright 2019 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

const fetch = require('./fetch-markdown.js');

module.exports.pre = (context, action) => {
};

module.exports.before = {
  fetch: async (context, { logger, request, secrets }) => {
    logger.info(JSON.stringify(request, null, 2));

    const idx = request.params.path.lastIndexOf('.');
    const resourcePath = decodeURIComponent(request.params.path.substring(0, idx));

    logger.info('resourcePath=' + resourcePath);
    secrets.REPO_RAW_ROOT = 'https://script.google.com/macros/s/AKfycbyJm5vcxgUcD_BL_HEaXOkYZ1jQGVsHeLkDjlAe31xEQ8P7-wq_/exec';
    secrets.HTTP_TIMEOUT = 10000;

    await fetch(context, secrets, logger, resourcePath);


    // fetch is constructing this url
    // ${rootPath}/${owner}/${repo}/${ref}/${path}

    // Object.assign(request.params, {
    //   path: '?path=' + resourcePath,
    // });
  }
};
