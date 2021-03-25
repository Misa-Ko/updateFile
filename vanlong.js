function getDomainOfUrl(e) {
 return e.split("/")[2];
}

function getProtocol(e) {
 return e.split(":")[0];
}

function getRelateUrl(e) {
 var t = e.split("/");
 return t.pop(), t.join("/") + "/";
}

function getAbsoluteUrl(e, t) {
 return 0 == t.indexOf("//") ? "http:" + t : 0 == t.indexOf("http://") ? t : 0 == t.indexOf("https://") ? t : 0 == t.indexOf("/") ? getProtocol(e) + "://" + getDomainOfUrl(e) + t : getRelateUrl(e) + t;
}

function fetchAjax(url, callback) {
 fetch(url)
  .then((resp) => resp.text())
  .then(function (data) {
   if (callback && typeof callback === "function") {
    callback(data);
   }
  })
  .catch(function (err) {
   console.log(err);
  });
}

function getM3u8Data(e, t) {
 for (var n = e.split(/[\r\n]/), r = [], i = null, o = null, a = {}, s = 0; s < n.length; s++) {
  var u = n[s];
  if (u.indexOf("RESOLUTION=") > 0) {
   (i = u.split("RESOLUTION=").pop().split("x").pop()), i.indexOf("p") < 0 && (i += "p");
  }
  u.indexOf(".m3u8") > 0 && (a[i] || ((o = getAbsoluteUrl(t, u)), r.push({ file: o, label: i }), (a[i] = !0)));
 }
 return r.sort(function (e, t) {
  return e.label.replace("p", "") - t.label.replace("p", "");
 });
}

function getTagLevels(e) {
 if (e.match(/2048/)) {
  return "2048p";
 } else if (e.match(/1080/)) {
  return "1080p";
 } else if (e.match(/720/)) {
  return "720p";
 } else if (e.match(/480/)) {
  return "480p";
 } else if (e.match(/360/)) {
  return "360p";
 } else if (e.match(/240/)) {
  return "240p";
 } else if (e.match(/180/)) {
  return "180p";
 } else if (e.match(/144/)) {
  return "144p";
 } else {
  return e.split(",")[0] + "p";
 }
}

function getHtmlQualites(e) {
 for (var t = "", n = 0; n < e.length; n++) {
  var r = e[n],
   file = r.file,
   label = getTagLevels(r.label),
   fileCurrent;
  var getJWPLabel = localStorage.getItem("jwplayer.qualityLabel");
  if (label == getJWPLabel) {
   t += `    <li class="li active" label="${label}" link="${file}">${label}</li>\n`;
   fileCurrent = file;
  } else {
   t += `    <li class="li" label="${label}" link="${file}">${label}</li>\n`;
  }
 }
 if (fileCurrent) {
  init_player(fileCurrent);
 } else {
  init_player(e[0].file);
 }
 return `<div class="qualities">\n <ul>\n${t} </ul>\n</div>\n`;
}

function init_player(link, currentTime) {
 const player = jwplayer("player");
 var crrTime;
 if (currentTime) {
  crrTime = currentTime;
 } else {
  crrTime = null;
 }
 const setting = {
  sources: [
   {
    file: link,
    type: typeUrl,
   },
  ],
  aspectratio: "16:9",
  startparam: "start",
  autostart: true,
  preload: "none",
  aboutlink: "",
  abouttext: "P2PStreaming",
  cast: {
   appid: "0000",
  },
  base: ".",
  mute: false,
  volume: 100,
  androidhls: true,
 };
 player.setup(setting);
 if (crrTime) {
  const seek = crrTime == null ? "0" : crrTime;
  player.seek(seek);
 }
}

function ready(e) {
 if (document.readyState != "loading") {
  e();
 } else {
  document.addEventListener("DOMContentLoaded", e);
 }
}

function setupPlayer() {
 var n = {
   encode: function (e) {
    if (window.TextEncoder) return new TextEncoder("utf-8").encode(e);
    for (var t = unescape(encodeURIComponent(e)), n = new Uint8Array(t.length), r = 0; r < t.length; r++) n[r] = t.charCodeAt(r);
    return n;
   },
  },
  r = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
  o = (navigator.userAgent || "").indexOf("UCBrowser") > 0;
 var player_wrapper = document.querySelector("#player-wrapper"),
  qualities_html = document.querySelector(".qualities");
 if (isHls || r || -1 != navigator.appVersion.indexOf("Mac") || o) {
  if (qualities_html) {
   qualities_html.parentNode.removeChild(qualities_html);
  }
  fetchAjax(videoUrl, function (e) {
   var t = getM3u8Data(e, videoUrl),
    n = getHtmlQualites(t);
   player_wrapper.innerHTML += n;
   var qualitie_li = document.querySelectorAll(".qualities ul li");
   function toggleLevels(event, config) {
    var i,
     link = config.link,
     label = config.label;
    for (i = 0; i < qualitie_li.length; i++) {
     qualitie_li[i].className = qualitie_li[i].className.replace(" active", "");
    }
    event.currentTarget.className += " active";
    const currentTime = jwplayer().getCurrentTime();
    init_player(link, currentTime);
    localStorage.setItem("jwplayer.qualityLabel", label);
   }
   for (var i = 0; i < qualitie_li.length; i++) {
    qualitie_li[i].addEventListener("click", function () {
     var link = this.getAttribute("link"),
      label = this.getAttribute("label");
     var config = {
      link: link,
      label: label,
     };
     let thisClass = this.className;
     if (thisClass.match("active")) {
      return false;
     } else {
      toggleLevels(event, config);
     }
    });
   }
   // initPlayer(t[0].file, t[0].file);
  });
  // init_player(videoUrl);
 } else {
  if (qualities_html) {
   qualities_html.parentNode.removeChild(qualities_html);
  }
  init_player(videoUrl);
 }
}

document.addEventListener("keydown", function (e) {
 return 123 != e.keyCode && !e.ctrlKey && !e.shiftKey && void 0;
});
document.addEventListener("contextmenu", function (e) {
 e.preventDefault();
});
