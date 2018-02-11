/**
 * Copyright (c) 2017, KETI
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 * 1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 * 3. The name of the author may not be used to endorse or promote products derived from this software without specific prior written permission.
 * THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @file
 * @copyright KETI Korea 2017, OCEAN
 * @author Il Yeup Ahn [iyahn@keti.re.kr]
 */

var url = require('url');
var xml2js = require('xml2js');
var xmlbuilder = require('xmlbuilder');
var util = require('util');
var responder = require('./responder');


exports.build_mms = function(request, response, resource_Obj, body_Obj, callback) {
    var rootnm = request.headers.rootnm;

    // check NP
    if ((body_Obj[rootnm]['ty'] != null) || (body_Obj[rootnm]['ri'] != null) || (body_Obj[rootnm]['pi'] != null) ||
        (body_Obj[rootnm]['ct'] != null) || (body_Obj[rootnm]['lt'] != null) || (body_Obj[rootnm]['st'] != null) ||
        (body_Obj[rootnm]['sid'] != null)) {
        body_Obj = {};
        body_Obj['dbg'] = 'NP Tag is in body';
        responder.response_result(request, response, 400, body_Obj, 4000, request.url, 'NP Tag is in body');
        callback('0', resource_Obj);
        return '0';
    }
    // check M
    else if ((body_Obj[rootnm]['soid'] == null) || (body_Obj[rootnm]['asd'] == null)) {
        body_Obj = {};
        body_Obj['dbg'] = 'M Tag (soid, asd) is none in body';
        responder.response_result(request, response, 400, body_Obj, 4000, request.url, 'M Tag is none in body');
        callback('0', resource_Obj);
        return '0';
    }
    else {
        resource_Obj[rootnm].acpi = (body_Obj[rootnm].acpi) ? body_Obj[rootnm].acpi : [];
        resource_Obj[rootnm].et = (body_Obj[rootnm].et) ? body_Obj[rootnm].et : resource_Obj[rootnm].et;
        resource_Obj[rootnm].lbl = (body_Obj[rootnm].lbl) ? body_Obj[rootnm].lbl : [];
        resource_Obj[rootnm].at = (body_Obj[rootnm].at) ? body_Obj[rootnm].at : [];
        resource_Obj[rootnm].aa = (body_Obj[rootnm].aa) ? body_Obj[rootnm].aa : [];
        resource_Obj[rootnm].soid = body_Obj[rootnm]['soid'];
        resource_Obj[rootnm].asd = body_Obj[rootnm]['asd'];
        resource_Obj[rootnm].stid = body_Obj[rootnm]['stid'] == null ? '' : body_Obj[rootnm]['stid'];
        resource_Obj[rootnm].osd = body_Obj[rootnm]['osd'] == null ? '' : body_Obj[rootnm]['osd'];
        resource_Obj[rootnm].sst = body_Obj[rootnm]['sst'] == null ? 'OFFLINE' : body_Obj[rootnm]['sst'];
    }
    resource_Obj[rootnm].sid = resource_Obj[rootnm].ri;

    if (resource_Obj[rootnm].et != '') {
        if (resource_Obj[rootnm].et < resource_Obj[rootnm].ct) {
            body_Obj = {};
            body_Obj['dbg'] = 'expiration is before now';
            responder.response_result(request, response, 400, body_Obj, 4000, request.url, 'expiration is before now');
            callback('0', resource_Obj);
            return '0';
        }
    }

    callback('1', resource_Obj);
};

//
//
// exports.modify_mms = function(request, response, resource_Obj, body_Obj, callback) {
//     var rootnm = request.headers.rootnm;
//
//     // check M
//     for (var attr in update_m_attr_list[rootnm]) {
//         if (update_m_attr_list[rootnm].hasOwnProperty(attr)) {
//             if (body_Obj[rootnm].includes(attr)) {
//             }
//             else {
//                 body_Obj = {};
//                 body_Obj['dbg'] = 'BAD REQUEST: ' + attr + ' is \'Mandatory\' attribute';
//                 responder.response_result(request, response, 400, body_Obj, 4000, request.url, body_Obj['dbg']);
//                 callback('0', resource_Obj);
//                 return '0';
//             }
//         }
//     }
//
//     // check NP and body
//     for (attr in body_Obj[rootnm]) {
//         if (body_Obj[rootnm].hasOwnProperty(attr)) {
//             if (update_np_attr_list[rootnm].includes(attr)) {
//                 body_Obj = {};
//                 body_Obj['dbg'] = 'BAD REQUEST: ' + attr + ' is \'Not Present\' attribute';
//                 responder.response_result(request, response, 400, body_Obj, 4000, request.url, body_Obj['dbg']);
//                 callback('0', resource_Obj);
//                 return '0';
//             }
//             else {
//                 if (update_opt_attr_list[rootnm].includes(attr)) {
//                 }
//                 else {
//                     body_Obj = {};
//                     body_Obj['dbg'] = 'NOT FOUND: ' + attr + ' attribute is not defined';
//                     responder.response_result(request, response, 404, body_Obj, 4004, request.url, body_Obj['dbg']);
//                     callback('0', resource_Obj);
//                     return '0';
//                 }
//             }
//         }
//     }
//
//     update_body(rootnm, body_Obj, resource_Obj); // (attr == 'aa' || attr == 'poa' || attr == 'lbl' || attr == 'acpi' || attr == 'srt' || attr == 'nu' || attr == 'mid' || attr == 'macp')
//
//     resource_Obj[rootnm].st = (parseInt(resource_Obj[rootnm].st, 10) + 1).toString();
//
//     var cur_d = new Date();
//     resource_Obj[rootnm].lt = cur_d.toISOString().replace(/-/, '').replace(/-/, '').replace(/:/, '').replace(/:/, '').replace(/\..+/, '');
//
//     if (resource_Obj[rootnm].et != '') {
//         if (resource_Obj[rootnm].et < resource_Obj[rootnm].ct) {
//             body_Obj = {};
//             body_Obj['dbg'] = 'expiration is before now';
//             responder.response_result(request, response, 400, body_Obj, 4000, request.url, 'expiration is before now');
//             callback('0', resource_Obj);
//             return '0';
//         }
//     }
//
//     callback('1', resource_Obj);
// };

