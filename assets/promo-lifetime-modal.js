(function () {
  "use strict";

  var CONFIG = {
    enabled: true,
    deadline: "2026-09-01T23:59:59+08:00",
    originalPrice: 888,
    promoPrice: 698,
    wechatId: "jianyi8679",
    wechatNote: "老粉",
    showDelayMs: 1800,
    dismissCooldownMs: 24 * 60 * 60 * 1000,
    storageKey: "qipaws-lifetime-promo-dismissed"
  };

  if (!CONFIG.enabled || isExpired()) return;

  var script = document.currentScript;
  var assetBase = script && script.src
    ? script.src.replace(/[^/]+$/, "")
    : "assets/";

  var overlay = null;
  var fab = null;

  init();

  function init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", build);
    } else {
      build();
    }
  }

  function build() {
    injectMarkup();
    bindEvents();
    fab = document.getElementById("promo-lifetime-fab");
    if (fab) fab.classList.add("is-visible");
    if (!wasRecentlyDismissed()) {
      window.setTimeout(openModal, CONFIG.showDelayMs);
    }
  }

  function injectMarkup() {
    var daysLeft = getDaysLeft();
    var deadlineText = daysLeft > 0
      ? "距 9 月 1 日截止还剩 <strong>" + daysLeft + " 天</strong>"
      : "活动即将结束";

    var html =
      '<div class="promo-lifetime-overlay" id="promo-lifetime-overlay" role="dialog" aria-modal="true" aria-labelledby="promo-lifetime-title">' +
        '<div class="promo-lifetime-modal">' +
          '<button type="button" class="promo-lifetime-close" id="promo-lifetime-close" aria-label="关闭">×</button>' +
          '<span class="promo-lifetime-ribbon">老粉专属回馈</span>' +
          '<h2 class="promo-lifetime-title" id="promo-lifetime-title">终身会员 · 上一周期价格为你保留</h2>' +
          '<p class="promo-lifetime-subtitle">感谢一路支持。App 内现价 ¥' + CONFIG.originalPrice + "，老粉回馈价 ¥" + CONFIG.promoPrice + "。</p>" +
          '<div class="promo-lifetime-price">' +
            '<span class="promo-lifetime-price-old">¥' + CONFIG.originalPrice + "</span>" +
            '<span class="promo-lifetime-price-new"><small>¥</small>' + CONFIG.promoPrice + "</span>" +
            '<span class="promo-lifetime-save">省 ¥' + (CONFIG.originalPrice - CONFIG.promoPrice) + "</span>" +
          "</div>" +
          '<div class="promo-lifetime-deadline">⏰ ' + deadlineText + " · 仅限老粉</div>" +
          '<ul class="promo-lifetime-perks">' +
            "<li>永久无限使用</li>" +
            "<li>无限真气</li>" +
            "<li>一次买断</li>" +
          "</ul>" +
          '<button type="button" class="promo-lifetime-cta" id="promo-lifetime-cta">立即领取老粉价 ¥' + CONFIG.promoPrice + "</button>" +
          '<button type="button" class="promo-lifetime-dismiss" id="promo-lifetime-dismiss">稍后再说</button>' +
          '<div class="promo-lifetime-wechat" id="promo-lifetime-wechat">' +
            '<p class="promo-lifetime-wechat-title">添加微信领取老粉价</p>' +
            '<div class="promo-lifetime-wechat-body">' +
              '<img class="promo-lifetime-qr" src="' + assetBase + 'wechat-qr.jpg" alt="微信二维码，扫码添加简易" width="120" height="120">' +
              '<div class="promo-lifetime-wechat-info">' +
                '<div class="promo-lifetime-wechat-id">' +
                  "<span>微信号：" + CONFIG.wechatId + "</span>" +
                  '<button type="button" class="promo-lifetime-copy" id="promo-lifetime-copy">复制</button>' +
                "</div>" +
                '<p class="promo-lifetime-wechat-hint">备注「' + CONFIG.wechatNote + "」方便识别。<br>核实后为你开通优惠。</p>" +
              "</div>" +
            "</div>" +
          "</div>" +
          '<p class="promo-lifetime-note">优惠通过开发者渠道发放，属老粉回馈活动，与 App Store 标价不同。</p>' +
        "</div>" +
      "</div>" +
      '<button type="button" class="promo-lifetime-fab" id="promo-lifetime-fab" aria-label="查看老粉回馈价">老粉 ¥' + CONFIG.promoPrice + "</button>";

    var root = document.createElement("div");
    root.innerHTML = html;
    while (root.firstChild) {
      document.body.appendChild(root.firstChild);
    }
    overlay = document.getElementById("promo-lifetime-overlay");
  }

  function bindEvents() {
    var closeBtn = document.getElementById("promo-lifetime-close");
    var dismissBtn = document.getElementById("promo-lifetime-dismiss");
    var ctaBtn = document.getElementById("promo-lifetime-cta");
    var copyBtn = document.getElementById("promo-lifetime-copy");
    var fabBtn = document.getElementById("promo-lifetime-fab");

    if (closeBtn) closeBtn.addEventListener("click", dismissModal);
    if (dismissBtn) dismissBtn.addEventListener("click", dismissModal);
    if (ctaBtn) {
      ctaBtn.addEventListener("click", function () {
        var wechat = document.getElementById("promo-lifetime-wechat");
        if (wechat) wechat.classList.add("is-visible");
        ctaBtn.textContent = "请添加微信领取";
        ctaBtn.disabled = true;
        ctaBtn.style.opacity = "0.85";
        ctaBtn.style.cursor = "default";
      });
    }
    if (copyBtn) copyBtn.addEventListener("click", copyWechatId);
    if (fabBtn) fabBtn.addEventListener("click", openModal);

    if (overlay) {
      overlay.addEventListener("click", function (event) {
        if (event.target === overlay) dismissModal();
      });
    }

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && overlay && overlay.classList.contains("is-open")) {
        dismissModal();
      }
    });
  }

  function openModal() {
    if (!overlay || isExpired()) return;
    resetWechatStep();
    overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
    if (fab) fab.classList.remove("is-visible");
  }

  function resetWechatStep() {
    var wechat = document.getElementById("promo-lifetime-wechat");
    var ctaBtn = document.getElementById("promo-lifetime-cta");
    if (wechat) wechat.classList.remove("is-visible");
    if (ctaBtn) {
      ctaBtn.textContent = "立即领取老粉价 ¥" + CONFIG.promoPrice;
      ctaBtn.disabled = false;
      ctaBtn.style.opacity = "";
      ctaBtn.style.cursor = "";
    }
  }

  function dismissModal() {
    if (!overlay) return;
    overlay.classList.remove("is-open");
    document.body.style.overflow = "";
    try {
      localStorage.setItem(CONFIG.storageKey, String(Date.now()));
    } catch (e) { /* ignore */ }
    if (fab && !isExpired()) fab.classList.add("is-visible");
  }

  function copyWechatId() {
    var copyBtn = document.getElementById("promo-lifetime-copy");
    var done = function () {
      if (!copyBtn) return;
      copyBtn.textContent = "已复制";
      copyBtn.classList.add("is-copied");
      window.setTimeout(function () {
        copyBtn.textContent = "复制";
        copyBtn.classList.remove("is-copied");
      }, 2000);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(CONFIG.wechatId).then(done).catch(fallbackCopy);
    } else {
      fallbackCopy();
    }

    function fallbackCopy() {
      var input = document.createElement("textarea");
      input.value = CONFIG.wechatId;
      input.setAttribute("readonly", "");
      input.style.position = "fixed";
      input.style.left = "-9999px";
      document.body.appendChild(input);
      input.select();
      try {
        document.execCommand("copy");
        done();
      } catch (e) { /* ignore */ }
      document.body.removeChild(input);
    }
  }

  function isExpired() {
    return Date.now() >= new Date(CONFIG.deadline).getTime();
  }

  function getDaysLeft() {
    var diff = new Date(CONFIG.deadline).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
  }

  function wasRecentlyDismissed() {
    try {
      var raw = localStorage.getItem(CONFIG.storageKey);
      if (!raw) return false;
      var dismissedAt = parseInt(raw, 10);
      return Date.now() - dismissedAt < CONFIG.dismissCooldownMs;
    } catch (e) {
      return false;
    }
  }
})();
