import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const htmlPath = new URL("../dist/index.html", import.meta.url);
const cssPath = new URL("../dist/styles.css", import.meta.url);
const html = await readFile(htmlPath, "utf8").catch(() => "");
const css = await readFile(cssPath, "utf8").catch(() => "");
const hostingPath = new URL("../.openai/hosting.json", import.meta.url);
const hosting = JSON.parse(await readFile(hostingPath, "utf8"));
const visibleText = (source) => source
  .replace(/<[^>]*>/g, "")
  .replaceAll("&amp;", "&")
  .replace(/\s+/g, " ")
  .trim();
const appModule = await import("../dist/app.js");

const sectionIds = [
  "problems",
  "growth-operations",
  "priorities",
  "experience",
  "tools",
  "capabilities",
  "operating-trio",
  "services",
  "why-1mem",
  "case-studies",
];

test("the published narrative keeps the ten approved sections in order", () => {
  const positions = sectionIds.map((id) => html.indexOf(`id="${id}"`));
  assert.ok(positions.every((position) => position >= 0), "every approved section must exist");
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
});

test("the Sites manifest contains only supported static-hosting fields", () => {
  assert.deepEqual(Object.keys(hosting).sort(), ["project_id", "static"]);
  assert.equal(hosting.static.directory, "dist");
});

test("the published page exposes the approved identity and contact routes", () => {
  for (const value of [
    "1MEM Growth Operations",
    "Nguyễn Văn Nhân",
    "https://zalo.me/0967347781",
    "tel:+84967347781",
    "mailto:nhannv.working@gmail.com",
    "https://linkedin.com/in/nguyenvannhan/",
  ]) {
    assert.ok(html.includes(value), `missing ${value}`);
  }
});

test("the case-study rail preserves the approved brand sequence", () => {
  const brands = ["Onici", "Tài Đạt", "Lotus", "Vạn Hạnh Mall", "Hùng Vương", "LS2", "Osen Hotel"];
  const caseSection = html.slice(html.indexOf('id="case-studies"'));
  const caseRail = caseSection.slice(caseSection.indexOf('<div class="case-grid">'));
  const positions = brands.map((brand) => caseRail.indexOf(brand));
  assert.ok(positions.every((position) => position >= 0), "every approved brand must exist");
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
  assert.doesNotMatch(caseRail, /\+\d+%|\d+x ROI|doanh thu tăng/i);
});

test("the case-study section spotlights three live client websites without unverified KPIs", () => {
  const caseSection = html.slice(html.indexOf('id="case-studies"'));
  const showcaseStart = caseSection.indexOf('class="website-showcase"');
  const portfolioStart = caseSection.indexOf('class="case-portfolio-heading"');
  const miniappStart = caseSection.indexOf('class="miniapp-portfolio-card"');
  const showcase = caseSection.slice(showcaseStart, miniappStart);

  assert.ok(showcaseStart >= 0, "the client website showcase must exist");
  assert.ok(showcaseStart < miniappStart && miniappStart < portfolioStart, "the website showcase must appear before the remaining case-study rail");
  assert.equal((showcase.match(/class="website-card\b/g) ?? []).length, 3);

  for (const [brand, url] of [
    ["Osen Hotel", "https://www.osenhotel.com/"],
    ["Onici", "https://www.onici.vn/"],
    ["LS2 Việt Nam", "https://ls2.vn/"],
  ]) {
    assert.ok(showcase.includes(brand), `missing website brand: ${brand}`);
    assert.ok(showcase.includes(`href="${url}"`), `missing live website link: ${url}`);
  }

  assert.equal((showcase.match(/target="_blank" rel="noopener noreferrer"/g) ?? []).length, 3);
  assert.equal((showcase.match(/Đang trực tiếp triển khai/g) ?? []).length, 3);
  assert.doesNotMatch(showcase, /\+\d+%|\d+x ROI|doanh thu tăng|chuyển đổi tăng/i);
  assert.match(css, /\.website-grid\s*\{[^}]*display:\s*grid/);
  assert.match(css, /@media\s*\(max-width:\s*640px\)[\s\S]*\.website-grid\s*\{[^}]*grid-template-columns:\s*1fr/);
  assert.match(css, /\.website-card:focus-visible\s*\{/);
});

test("the companion showcase links the supplied Zalo Mini App poster to the Canva design library", () => {
  const caseSection = html.slice(html.indexOf('id="case-studies"'));
  const showcaseStart = caseSection.indexOf('class="miniapp-portfolio-card"');
  const portfolioStart = caseSection.indexOf('class="case-portfolio-heading"');
  const showcase = caseSection.slice(showcaseStart, portfolioStart);

  assert.ok(showcaseStart >= 0, "the Zalo Mini App design showcase must exist");
  assert.ok(showcaseStart < portfolioStart, "the Mini App showcase must remain inside the highlighted work area");
  assert.match(showcase, /href="https:\/\/canva\.link\/bv7lsndxeh9qz2b"[^>]+target="_blank" rel="noopener noreferrer"/);
  assert.ok(showcase.includes('src="./assets/zalo-mini-app-portfolio.png"'));
  assert.ok(showcase.includes('alt="Poster Zalo Mini App cho mọi ngành nghề"'));
  assert.ok(showcase.includes("Xem ngay các giao diện đã thiết kế"));
  assert.match(css, /\.miniapp-portfolio-card\s*\{[^}]*display:\s*grid/);
  assert.match(css, /@media\s*\(max-width:\s*640px\)[\s\S]*\.miniapp-portfolio-card\s*\{[^}]*grid-template-columns:\s*1fr/);
  assert.match(css, /\.miniapp-portfolio-card:focus-visible\s*\{/);
});

test("the ZBS remarketing stream follows the OA growth proof without exposing customer data", () => {
  const caseSection = html.slice(html.indexOf('id="case-studies"'));
  const oaStart = caseSection.indexOf('class="oa-growth-showcase"');
  const zbsStart = caseSection.indexOf('id="zbs-message-showcase"');
  const websiteStart = caseSection.indexOf('class="website-showcase"');
  const zbsShowcase = caseSection.slice(zbsStart, websiteStart);

  assert.ok(zbsStart >= 0, "the ZBS message showcase must exist");
  assert.ok(oaStart < zbsStart && zbsStart < websiteStart, "the ZBS stream must sit between OA growth and client websites");
  assert.ok(visibleText(zbsShowcase).includes("Hàng trăm mẫu tin đã được gửi đi."));
  assert.equal((zbsShowcase.match(/class="zbs-track zbs-track--/g) ?? []).length, 2);
  assert.ok((zbsShowcase.match(/class="zbs-message-card\b/g) ?? []).length >= 12);
  assert.doesNotMatch(zbsShowcase, /0967347781|84967347781|Nguyễn Nguyễn Văn Nhân|Nguyễn Anh Nhân/i);
  assert.match(css, /@keyframes\s+zbs-marquee-forward/);
  assert.match(css, /@keyframes\s+zbs-marquee-reverse/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.zbs-track\s*\{[^}]*animation:\s*none/);
});

test("the Zalo OA proof grid publishes all eight verified audience snapshots", () => {
  const caseSection = html.slice(html.indexOf('id="case-studies"'));
  const caseText = visibleText(caseSection);
  const snapshots = [
    ["Lotus Group Loyalty", "66.424 người quan tâm"],
    ["Vạn Hạnh Mall", "18.320 người quan tâm"],
    ["Hùng Vương Plaza", "9.865 người quan tâm"],
    ["OHAR Healthy Life", "3.493 người quan tâm"],
    ["Determinant Vietnam", "3.096 người quan tâm"],
    ["Bếp Của Mẹ Onici", "2.814 người quan tâm"],
    ["Bảo hộ xe máy Tài Đạt", "1.647 người quan tâm"],
    ["LS2 Store VN", "55 người quan tâm"],
  ];

  assert.ok(caseSection.includes('class="oa-growth-grid"'), "the OA proof grid must exist");
  for (const [brand, audience] of snapshots) {
    assert.ok(caseText.includes(brand), `missing OA brand: ${brand}`);
    assert.ok(caseText.includes(audience), `missing audience snapshot: ${audience}`);
  }
  assert.equal((caseSection.match(/class="oa-growth-card\b/g) ?? []).length, 8);
  assert.doesNotMatch(caseSection, /\+\d+%|\d+x ROI|tăng \d+%/i);
});

test("the Zalo OA proof grid distinguishes scaled, growing, and newly building accounts", () => {
  const caseSection = html.slice(html.indexOf('id="case-studies"'));

  assert.equal((caseSection.match(/data-stage="scaled"/g) ?? []).length, 3);
  assert.equal((caseSection.match(/data-stage="growing"/g) ?? []).length, 4);
  assert.equal((caseSection.match(/data-stage="building"/g) ?? []).length, 1);
  assert.match(
    caseSection,
    /data-stage="building"[^>]+aria-label="LS2 Store VN, 55 người quan tâm, giai đoạn xây dựng mới"/,
  );
  assert.match(css, /\.oa-growth-grid\s*\{[^}]*display:\s*grid/);
  assert.match(css, /@media\s*\(max-width:\s*640px\)[\s\S]*\.oa-growth-grid\s*\{[^}]*grid-template-columns:\s*1fr/);
});

test("the Tài Đạt OA card uses an accessible brand logo instead of a text monogram", () => {
  const caseSection = html.slice(html.indexOf('id="case-studies"'));
  const taiDatCard = caseSection.slice(
    caseSection.indexOf('aria-label="Bảo hộ xe máy Tài Đạt'),
    caseSection.indexOf('aria-label="LS2 Store VN'),
  );

  assert.match(taiDatCard, /<img\s+[^>]*alt="Logo Bảo hộ xe máy Tài Đạt"/);
  assert.doesNotMatch(taiDatCard, />TĐ<\/div>/);
  assert.match(
    css,
    /\.oa-avatar--tai-dat img\s*\{[^}]*object-fit:\s*cover;[^}]*object-position:\s*left center;/,
    "the wide Tài Đạt source must be cropped to its recognizable mascot mark",
  );
});

test("the page includes baseline accessibility and responsive hooks", () => {
  for (const token of [
    'lang="vi"',
    'name="viewport"',
    'rel="icon"',
    'class="skip-link"',
    'id="main-content"',
    'aria-label="Điều hướng chính"',
  ]) {
    assert.ok(html.includes(token), `missing ${token}`);
  }
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /--shell:\s*min\(1220px,\s*calc\(100vw\s*-\s*32px\)\)/);
  assert.match(css, /@media\s*\(min-width:\s*768px\)\s*and\s*\(max-width:\s*900px\)/);
  assert.match(css, /\.trio-flow li\s*\{[^}]*min-width:\s*0/);
  assert.match(css, /\.trio-output\s*\{[^}]*max-width:\s*100%/);
});

test("the first viewport states all eight approved operating problems", () => {
  const problemsSection = html.slice(
    html.indexOf('id="problems"'),
    html.indexOf('id="growth-operations"'),
  );
  for (const phrase of [
    "dữ liệu phân mảnh",
    "paid channels",
    "khai thác để tăng trưởng doanh thu",
    "Loyalty Program",
    "Ads tăng nhưng đơn hàng giảm",
    "thiếu điểm chạm",
    "giá trị âm",
    "ý tưởng thành hoạt động thực thi",
  ]) {
    assert.ok(problemsSection.includes(phrase), `missing problem: ${phrase}`);
  }
});

test("the hero solution card replaces the generic contact call to action", () => {
  const problemsSection = html.slice(
    html.indexOf('id="problems"'),
    html.indexOf('id="growth-operations"'),
  );

  assert.doesNotMatch(problemsSection, /Trao đổi bài toán cùng tôi/);
  assert.ok(problemsSection.includes('class="hero-solution-card"'));
  assert.ok(problemsSection.includes('href="https://cg.cnvwork.com/files/nhan/solution/agentic-cdp-360.html"'));
  assert.ok(problemsSection.includes('target="_blank" rel="noopener noreferrer"'));
  for (const phrase of [
    "Data · AI Agents · Engagement · Loyalty · Commerce",
    "Customer Intelligence",
    "Next Best Action",
    "One Platform · One Intelligence Layer",
    "Unlimited Growth",
    "Acquisition",
    "Conversion",
    "Retention",
    "Loyalty",
  ]) {
    assert.ok(problemsSection.includes(phrase), `missing hero solution message: ${phrase}`);
  }
});

test("the introduction explains the operator role and the four priorities", () => {
  for (const phrase of [
    "Growth Operations là giải pháp nhân sự Outsource",
    "Ưu tiên hàng đầu tôi hướng đến",
    "Strategy",
    "System",
    "Execution",
    "Data",
    "Optimization",
    "Tăng trưởng bền vững",
    "Linh hoạt dựa vào xu hướng",
    "Liên tục tối ưu",
    "Kiểm soát hệ thống",
  ]) {
    assert.ok(html.includes(phrase), `missing introduction phrase: ${phrase}`);
  }
});

test("the experience proof covers the approved industry portfolio", () => {
  const experienceSection = html.slice(
    html.indexOf('id="experience"'),
    html.indexOf('id="tools"'),
  );
  const experienceText = visibleText(experienceSection);
  assert.ok(experienceSection.includes('aria-label="Các nhóm ngành trong phạm vi portfolio"'));
  for (const industry of [
    "F&B chuỗi",
    "Trà & cà phê",
    "Brewery",
    "Siêu thị",
    "Nhà thuốc",
    "Mỹ phẩm",
    "Tiện lợi",
    "B2B & phân phối",
    "Dịch vụ",
    "Spa & thẩm mỹ",
    "Khách sạn",
    "Trung tâm thương mại",
  ]) {
    assert.ok(experienceText.includes(industry), `missing industry: ${industry}`);
  }
});

test("the experience proof presents seven accessible client brand logos", () => {
  const experienceSection = html.slice(
    html.indexOf('id="experience"'),
    html.indexOf('id="tools"'),
  );

  assert.ok(experienceSection.includes('class="brand-logo-grid"'));
  for (const brand of [
    "ONICI",
    "Tài Đạt",
    "Osen Hotel",
    "LS2 Helmets",
    "Lotus Group",
    "Hùng Vương Plaza",
    "Vạn Hạnh Mall",
  ]) {
    assert.ok(experienceSection.includes(`alt="Logo ${brand}"`), `missing accessible brand logo: ${brand}`);
  }
  assert.match(
    experienceSection,
    /src="https:\/\/hungvuongplaza\.com\.vn\/wp-content\/uploads\/2026\/05\/cropped-FAVICON_LOGO_HVP-270x270\.png"[^>]+alt="Logo Hùng Vương Plaza"[^>]+referrerpolicy="no-referrer"/,
    "Hùng Vương Plaza must use the official hotlink-safe brand mark",
  );
});

test("the tool ecosystem exposes meaningful brand logos", () => {
  const toolsSection = html.slice(
    html.indexOf('id="tools"'),
    html.indexOf('id="capabilities"'),
  );
  for (const logo of [
    "Lark Suite",
    "Odoo",
    "Haravan",
    "Sapo",
    "Google Workspace",
    "Zalo OA",
    "CNV CDP",
    "Microsoft Excel",
  ]) {
    assert.ok(toolsSection.includes(`alt="Logo ${logo}"`), `missing accessible logo: ${logo}`);
  }
});

test("the capability system contains six approved disciplines and the operating trio", () => {
  const pageText = visibleText(html);
  for (const phrase of [
    "Data & Marketing",
    "Chiến lược",
    "Technical",
    "Customer Experience",
    "Technical System",
    "Management Operation",
    "Mindset",
    "Toolset",
    "Skillset",
  ]) {
    assert.ok(pageText.includes(phrase), `missing capability: ${phrase}`);
  }
});

test("the service scope covers CDP, loyalty, omnichannel and supporting operations", () => {
  for (const phrase of [
    "Triển khai CDP &amp; Loyalty",
    "Marketing Automation Workflow",
    "hồ sơ khách hàng 360°",
    "Omnichannel",
    "Owned Channels",
    "Hỗ trợ kỹ thuật",
    "sản xuất content và hình ảnh",
    "AI Agent",
  ]) {
    assert.ok(html.includes(phrase), `missing service scope: ${phrase}`);
  }
});

test("the CDP and omnichannel panels link to their dedicated solution pages", () => {
  const cdpPanel = html.slice(
    html.indexOf('id="service-cdp"'),
    html.indexOf('class="service-item"', html.indexOf('id="service-cdp"')),
  );
  const omnichannelPanel = html.slice(
    html.indexOf('id="service-omnichannel"'),
    html.indexOf('class="service-item"', html.indexOf('id="service-omnichannel"')),
  );

  assert.ok(cdpPanel.includes('href="https://cg.cnvwork.com/files/nhan/solution/agentic-cdp-360.html"'));
  assert.ok(cdpPanel.includes("Khám phá giải pháp Agentic CDP 360"));
  assert.ok(omnichannelPanel.includes('href="https://cg.cnvwork.com/files/nhan/solution/cnvcdp-owned-platform.html#top"'));
  assert.ok(omnichannelPanel.includes("Khám phá giải pháp Owned Platform"));

  for (const panel of [cdpPanel, omnichannelPanel]) {
    assert.ok(panel.includes('class="solution-cta"'));
    assert.ok(panel.includes('target="_blank" rel="noopener noreferrer"'));
  }
});

test("the page presents verified experience without unverified outcome claims", () => {
  const experienceSection = html.slice(
    html.indexOf('id="experience"'),
    html.indexOf('id="tools"'),
  );
  const experienceText = visibleText(experienceSection);
  assert.ok(experienceText.includes("500+"));
  assert.ok(experienceText.includes("SME & Enterprise"));
  assert.doesNotMatch(experienceText, /\d+%|ROI|tỷ VNĐ/i);
});

test("navigation and service disclosures expose accessible control relationships", () => {
  for (const token of [
    'class="nav-toggle"',
    'aria-controls="primary-navigation"',
    'id="primary-navigation"',
    'aria-controls="service-cdp"',
    'aria-controls="service-omnichannel"',
    'aria-controls="service-support"',
    'target="_blank" rel="noopener noreferrer"',
  ]) {
    assert.ok(html.includes(token), `missing interaction contract: ${token}`);
  }
  assert.match(css, /:focus-visible/);
  assert.match(css, /min-height:\s*44px/);
});

test("the primary navigation preserves the approved journey", () => {
  const nav = html.slice(
    html.indexOf('id="primary-navigation"'),
    html.indexOf('</nav>', html.indexOf('id="primary-navigation"')),
  );
  const labels = [
    "Bài toán",
    "Growth Ops",
    "Ưu tiên",
    "Năng lực",
    "Dịch vụ",
    "Lý do chọn",
    "Case Study",
    "Liên hệ",
  ];
  const positions = labels.map((label) => nav.indexOf(label));
  assert.ok(positions.every((position) => position >= 0), "every approved navigation item must exist");
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
});

test("the premium visual system exposes a clear diagnostic and reading progress", () => {
  for (const token of [
    'class="scroll-progress"',
    'class="problem-board-head"',
    'class="problem-board-status"',
    'class="case-mark"',
  ]) {
    assert.ok(html.includes(token), `missing premium visual anchor: ${token}`);
  }
});

test("the mobile menu and Zalo route remain accessible on small screens", () => {
  assert.match(css, /\.primary-nav\s*\{[^}]*visibility:\s*hidden/s);
  assert.match(css, /\.primary-nav\[data-open="true"\]\s*\{[^}]*visibility:\s*visible/s);
  assert.ok(html.includes('class="mobile-zalo-cta"'));
});

test("essential copy remains at least sixteen pixels and external links announce new tabs", () => {
  const lastRuleFor = (selector) => {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return [...css.matchAll(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, "gs"))].at(-1)?.[1] ?? "";
  };

  assert.match(lastRuleFor(".problem-card p"), /font-size:\s*1rem/);
  assert.match(css, /\.service-panel li\s*\{[^}]*font-size:\s*1rem/s);
  assert.match(lastRuleFor(".evidence-note"), /font-size:\s*1rem/);

  const newTabLinks = html.match(/<a\b[^>]*target="_blank"[^>]*>/g) ?? [];
  const announcements = html.match(/mở trong tab mới/g) ?? [];
  assert.ok(newTabLinks.length > 0);
  assert.equal(announcements.length, newTabLinks.length);
});

test("interaction state helpers return deterministic next states", () => {
  assert.equal(typeof appModule.nextExpandedState, "function");
  assert.equal(typeof appModule.shouldElevateHeader, "function");
  assert.equal(typeof appModule.menuAccessibilityState, "function");
  assert.equal(typeof appModule.calculateScrollProgress, "function");
  assert.equal(appModule.nextExpandedState(false), true);
  assert.equal(appModule.nextExpandedState(true), false);
  assert.equal(appModule.shouldElevateHeader(16), false);
  assert.equal(appModule.shouldElevateHeader(17), true);
  assert.deepEqual(appModule.menuAccessibilityState(true, false), {
    ariaHidden: "true",
    inert: true,
  });
  assert.deepEqual(appModule.menuAccessibilityState(true, true), {
    ariaHidden: "false",
    inert: false,
  });
  assert.deepEqual(appModule.menuAccessibilityState(false, false), {
    ariaHidden: null,
    inert: false,
  });
  assert.equal(appModule.calculateScrollProgress(0, 2000, 1000), 0);
  assert.equal(appModule.calculateScrollProgress(500, 2000, 1000), 50);
  assert.equal(appModule.calculateScrollProgress(1600, 2000, 1000), 100);
  assert.equal(appModule.calculateScrollProgress(100, 800, 800), 0);
});
