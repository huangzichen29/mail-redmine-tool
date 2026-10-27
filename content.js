(() => {
  if (window.__mailRedmineSidebarLoaded) return;
  window.__mailRedmineSidebarLoaded = true;

  let language = "zh";
  const messages = {
    zh:{mailNotFound:"未能从当前 Outlook 阅读窗格识别邮件标题或正文。请展开具体邮件后重试。",notRedmine:"当前标签页不是配置的 Redmine 页面。",openNew:"请先打开 Redmine 新建票页面。",noControl:"没有找到控件",notSelect:"不是下拉选择控件",noOption:"页面没有选项",watcherAdded:"已添加",watcherMissing:"未找到或未确认",dueMissing:"未找到対応目途字段",linkMissing:"请在面板填写链接",unknown:"未知操作",ccExternalOnly:"请先在外部 Redmine 打开コールセンターチケット。",ccInternalOnly:"请切换到内部 Redmine 的新建票页面。",ccIssuePage:"请打开外部 Redmine 的 /issues/编号 页面。",ccTrackerMissing:"跟踪器选项中找不到“问合せ”。"},
    ja:{mailNotFound:"Outlook の閲覧ウィンドウから件名または本文を認識できません。メールを開いて、もう一度お試しください。",notRedmine:"現在のタブは設定済みの Redmine ページではありません。",openNew:"Redmine の新規チケット画面を開いてください。",noControl:"項目が見つかりません",notSelect:"選択リストではありません",noOption:"選択肢にありません",watcherAdded:"追加済み",watcherMissing:"見つからないか、追加を確認できません",dueMissing:"対応目途の項目が見つかりません",linkMissing:"サイドバーにURLを入力してください",unknown:"不明な操作です",ccExternalOnly:"外部 Redmine でコールセンターチケットを開いてください。",ccInternalOnly:"内部 Redmine の新規チケット画面に切り替えてください。",ccIssuePage:"外部 Redmine の /issues/番号 の画面を開いてください。",ccTrackerMissing:"トラッカーに「問合せ」がありません。"},
    en:{mailNotFound:"Could not identify the subject or body in the Outlook reading pane. Open a message and try again.",notRedmine:"The active tab is not a configured Redmine page.",openNew:"Open a new Redmine issue page first.",noControl:"Control not found",notSelect:"This is not a selectable list",noOption:"Option not found",watcherAdded:"Added",watcherMissing:"Not found or not confirmed",dueMissing:"Due date field not found",linkMissing:"Enter the link in the sidebar",unknown:"Unknown action",ccExternalOnly:"Open the call center ticket in external Redmine first.",ccInternalOnly:"Switch to a new issue page in internal Redmine.",ccIssuePage:"Open an external Redmine /issues/number page.",ccTrackerMissing:"The tracker list has no Inquiry option."}
  };
  const msg = key => (messages[language]||messages.zh)[key] || key;
  const fail = key => { const e=new Error(key); e.code=key; throw e; };
  const norm = s => (s || "").replace(/\s+/g, " ").trim();
  function all(selector, root = document) {
    const out = [], stack = [root], seen = new Set();
    while (stack.length) {
      const r = stack.pop();
      if (!r || seen.has(r)) continue;
      seen.add(r);
      try {
        out.push(...r.querySelectorAll(selector));
        for (const el of r.querySelectorAll("*")) if (el.shadowRoot) stack.push(el.shadowRoot);
      } catch (_) {}
    }
    return [...new Set(out)];
  }
  function visible(el) {
    if (!el) return false;
    const r = el.getBoundingClientRect(), s = getComputedStyle(el);
    return (r.width > 0 || r.height > 0) && s.visibility !== "hidden" && s.display !== "none";
  }
  function text(el) { return norm(el?.innerText || el?.textContent || el?.getAttribute?.("aria-label") || ""); }
  function tableCellText(cell) {
    const render = (node, omitTables=false) => {
      if (node.nodeType === Node.TEXT_NODE) return (node.nodeValue || "").replace(/\r/g,"").replace(/[ \t\f\v]+/g," ");
      if (node.nodeType !== Node.ELEMENT_NODE) return "";
      const tag=node.tagName;
      if (["SCRIPT","STYLE","NOSCRIPT","SVG","IMG"].includes(tag)) return "";
      if (tag==="BR") return "\n";
      const inside=[...node.childNodes].map(render).join("");
      // Outlook wraps even visually compact signature lines in nested blocks.
      // A single boundary per block follows rendered/copy behavior without
      // turning every <p> into an extra blank paragraph.
      if (tag==="P" || tag==="DIV" || tag==="LI" || tag==="SECTION" || tag==="ARTICLE" || tag==="BLOCKQUOTE") return "\uE000"+inside+"\uE000";
      if (tag==="A") {
        const href=node.getAttribute("href")||"", label=inside.trim();
        return label+(href&&!href.startsWith("mailto:")&&href!==label?" ("+href+")":"");
      }
      return inside;
    };
    return [...(cell?.childNodes||[])].map(render).join("")
      .replace(/[ \t]*\uE000(?:[ \t]*\uE000)+/g,"\uE000").replace(/\uE000/g,"\n")
      .replace(/[ \t]+\n/g,"\n").replace(/\n[ \t]+/g,"\n").replace(/\n{3,}/g,"\n\n").trim();
  }
  function isQuotedBlock(el) {
    return el?.nodeType===Node.ELEMENT_NODE && (el.tagName==="BLOCKQUOTE" || /rplyfwdmsg|quoted|originalmessage/i.test((el.id||"")+" "+(typeof el.className==="string"?el.className:"")));
  }
  function insideQuotedBlock(el) {
    for(let node=el?.parentElement;node;node=node.parentElement) if(isQuotedBlock(node)) return true;
    return false;
  }
  function bodyData(el, options={}) {
    const tables = [...(el?.querySelectorAll?.("table") || [])].map(table =>
      [...table.querySelectorAll("tr")].map(row =>
        [...row.querySelectorAll("th,td")].map(tableCellText)
      ).filter(row => row.some(Boolean))
    ).filter(rows => rows.length);
    const render = (node,omitTables=false) => {
      if (node.nodeType === Node.TEXT_NODE) return (node.nodeValue || "").replace(/[ \t\f\v]+/g, " ");
      if (node.nodeType !== Node.ELEMENT_NODE) return "";
      if (options.excludeQuotes && isQuotedBlock(node)) return "";
      const tag = node.tagName;
      if (["SCRIPT","STYLE","NOSCRIPT","SVG","IMG","VIDEO","AUDIO","IFRAME"].includes(tag)) return "";
      if (tag === "BR") return "\n";
      if (tag === "TABLE" && omitTables) return "";
      if (tag === "TABLE") {
        const rows = [...node.querySelectorAll("tr")].map(row =>
          [...row.querySelectorAll("th,td")].map(tableCellText)
        ).filter(row => row.some(Boolean));
        if (!rows.length) return "";
        return "\n" + rows.map(row => "| " + row.join(" | ") + " |").join("\n") + "\n";
      }
      const inside = [...node.childNodes].map(child=>render(child,omitTables)).join("");
      if (tag === "P") return "\uE000" + inside + "\uE000";
      if (tag === "LI") return "\uE000• " + inside.trim() + "\uE000";
      if (/^H[1-6]$/.test(tag)) return "\uE000" + inside + "\uE000";
      if (tag === "DIV" || tag === "SECTION" || tag === "ARTICLE" || tag === "BLOCKQUOTE") return "\uE000" + inside + "\uE000";
      if (tag === "A") {
        const href = node.getAttribute("href") || "";
        const label = inside.trim();
        return label + (href && !href.startsWith("mailto:") && href !== label ? " (" + href + ")" : "");
      }
      return inside;
    };
    const clean = raw => raw.replace(/\r/g, "").replace(/[ \t]*\uE000(?:[ \t]*\uE000)+/g,"\uE000").replace(/\uE000/g,"\n").replace(/[ \t]+\n/g, "\n").replace(/\n[ \t]+/g, "\n")
      .replace(/\n{3,}/g, "\n\n").trim();
    const raw = el ? [...el.childNodes].map(node=>render(node,false)).join("") : "";
    const introRaw = el ? [...el.childNodes].map(node=>render(node,true)).join("") : "";
    return {text:clean(raw), intro:clean(introRaw), tables};
  }
  function parseDate(el) {
    const raw = typeof el==="string" ? el : [el?.getAttribute("title"), el?.getAttribute("aria-label"), el?.getAttribute("datetime"), text(el)].filter(Boolean).join(" ");
    const iso = raw.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?/);
    if (iso) {
      const d = new Date(iso[0]);
      if (!Number.isNaN(d.getTime())) return {time:d.getTime(), value:d};
    }
    const localized = raw.match(/(\d{4})[年/.-]\s*(\d{1,2})[月/.-]\s*(\d{1,2})日?\s*(?:\(([日月火水木金土])\))?\s*(\d{1,2}):(\d{2})/);
    if (localized) {
      const d = new Date(Number(localized[1]), Number(localized[2])-1, Number(localized[3]), Number(localized[5]), Number(localized[6]));
      return {time:d.getTime(), value:d};
    }
    return null;
  }
  function formatDate(date) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone:"Asia/Tokyo", year:"numeric", month:"2-digit", day:"2-digit",
      weekday:"short", hour:"2-digit", minute:"2-digit", hourCycle:"h23"
    }).formatToParts(date);
    const p = Object.fromEntries(parts.map(x => [x.type,x.value]));
    const weekdays = {Sun:"日",Mon:"月",Tue:"火",Wed:"水",Thu:"木",Fri:"金",Sat:"土"};
    return p.year + "/" + p.month + "/" + p.day + " (" + (weekdays[p.weekday] || "") + ") " + p.hour + ":" + p.minute;
  }
  function extractEmbeddedReplies(bodyEl) {
    if(!bodyEl) return [];
    const quoted=all('blockquote,[id*="RplyFwdMsg" i],[id*="quoted" i],[class*="quoted" i],[class*="gmail_quote" i]',bodyEl)
      .filter(visible).filter(el=>text(el));
    const leaves=quoted.filter(el=>!quoted.some(other=>other!==el&&el.contains(other)));
    return leaves.map(el=>{
      const data=bodyData(el);
      const dateNode=all('time,[title],[aria-label]',el).filter(visible).map(x=>parseDate(x)).find(Boolean);
      const date=dateNode||parseDate(el.innerText||el.textContent||"");
      const body=data.text.split("\n").filter(line=>!/^\s*(?:[-_]{4,}\s*(?:Original Message|転送メッセージ|元のメッセージ)?\s*[-_]{0,}|(?:From|Sent|To|Cc|Subject|Date|差出人|送信者|送信日時|宛先|件名|日付)\s*[:：])/i.test(line)).join("\n").replace(/\n{3,}/g,"\n\n").trim();
      return body?{received:date?formatDate(date.value):"",sortTime:date?.time||0,body,tables:data.tables}:null;
    }).filter(Boolean);
  }
  function extractMail() {
    // Outlook versions use both stable MSG_* ids and semantic <time> nodes.
    // Pair by message container first; vertical proximity is only a fallback.
    const panes = all('[class*="ReadingPane"], [class*="readingPane"], [aria-label*="Reading pane"], [aria-label*="閲覧ウィンドウ"], [role="main"]')
      .filter(visible);
    const scope = panes.find(el=>/readingpane/i.test(String(el.className||""))||/閲覧ウィンドウ|Reading pane/i.test(el.getAttribute("aria-label")||"")) || panes.find(el=>el.getAttribute("role")==="main") || document;
    const dateCandidates = all('[id^="MSG_"][id$="_DATETIME"], time[datetime], [data-testid*="timestamp"], [data-testid*="date-time"], [title], [aria-label]',scope)
      .filter(visible).filter(el=>!insideQuotedBlock(el)).filter(el=>el.tagName==="TIME"||/20\d{2}[-/.年]/.test((el.getAttribute("datetime")||"")+" "+(el.getAttribute("title")||"")+" "+(el.getAttribute("aria-label")||"")))
      .map(el=>({el,date:parseDate(el)})).filter(x=>x.date);
    // One visible timestamp is often repeated on a button and its labelled
    // wrapper. Keep the most specific Outlook timestamp node per instant.
    const dateByTime=new Map();
    for(const item of dateCandidates){
      const key=String(item.date.time), group=dateByTime.get(key)||[];
      const score=el=>(/^MSG_.*_DATETIME$/.test(el.id)?100:el.tagName==="TIME"?80:0)-Math.min((el.innerText||"").length,60);
      const relatedIndex=group.findIndex(prior=>prior.el===item.el||prior.el.contains(item.el)||item.el.contains(prior.el));
      if(relatedIndex<0)group.push(item);
      else if(score(item.el)>score(group[relatedIndex].el))group[relatedIndex]=item;
      dateByTime.set(key,group);
    }
    const dateEls=[...dateByTime.values()].flat().map(x=>x.el);
    const subjectEls = all('[id^="MSG_"][id$="_SUBJECT"]',scope).filter(visible);
    const candidates = all('[id^="UniqueMessageBody"], [data-testid*="message-body"], [aria-label*="メッセージ本文"], [aria-label*="Message body"]',scope)
      .filter(visible).filter(el => text(el));
    const bodyEls = candidates.filter(el=>!candidates.some(other=>other!==el&&el.contains(other)));
    const messages = [...new Map(dateEls.map((el,index) => {
      const prefix = el.id.replace(/_DATETIME$/, "");
      const subjectEl = subjectEls.find(s => s.id === prefix + "_SUBJECT");
      const date = parseDate(el);
      let root=el, ownedBodies=[];
      for(let node=el;node&&node!==scope.parentElement;node=node.parentElement){
        const dateCount=new Set(all('[id^="MSG_"][id$="_DATETIME"], time[datetime], [data-testid*="timestamp"], [data-testid*="date-time"], [title], [aria-label]',node)
          .filter(visible).filter(x=>!insideQuotedBlock(x)).map(x=>parseDate(x)).filter(Boolean).map(x=>x.time)).size;
        if(dateCount>1) break;
        const found=candidates.filter(body=>node.contains(body));
        if(found.length){root=node;ownedBodies=found;break;}
        if(node===scope) break;
      }
      return [el.id||`date-${date?.time||0}-${index}`,{el,subjectEl,subject:text(subjectEl),date,y:el.getBoundingClientRect().top,root,ownedBodies}];
    }).filter(([,x])=>x.date))].map(([,x])=>x).sort((a,b) => b.date.time-a.date.time);
    const latest = messages[0];
    if (latest) {
      const pairs=messages.flatMap(message=>(message.ownedBodies.length?message.ownedBodies:bodyEls).map(bodyEl=>({message,bodyEl,distance:Math.abs(bodyEl.getBoundingClientRect().top-message.y)})))
        .sort((a,b)=>a.distance-b.distance);
      const messageBodies=new Map(),usedBodies=new Set();
      for(const pair of pairs){if(messageBodies.has(pair.message)||usedBodies.has(pair.bodyEl))continue;messageBodies.set(pair.message,pair.bodyEl);usedBodies.add(pair.bodyEl);}
      const latestBody=messageBodies.get(latest)||bodyEls.slice().sort((a,b)=>
        Math.abs(a.getBoundingClientRect().top-latest.y)-Math.abs(b.getBoundingClientRect().top-latest.y))[0];
      let subject = latest.subject;
      if (!subject) {
        const closest = subjectEls.slice().sort((a,b) =>
          Math.abs(a.getBoundingClientRect().top-latest.y) - Math.abs(b.getBoundingClientRect().top-latest.y)
        )[0];
        subject = text(closest);
      }
      const content = bodyData(latestBody,{excludeQuotes:true});
      const embeddedReplies=extractEmbeddedReplies(latestBody);
      const replies=messages.slice(1).map(message=>{
        const el=messageBodies.get(message);
        const part=bodyData(el,{excludeQuotes:true});
        return el&&part.text?{message:{received:formatDate(message.date.value),sortTime:message.date.time,body:part.text,tables:part.tables},embedded:extractEmbeddedReplies(el)}:null;
      }).filter(Boolean).flatMap(x=>[x.message,...x.embedded]);
      replies.push(...embeddedReplies);
      replies.sort((a,b)=>a.sortTime&&b.sortTime?b.sortTime-a.sortTime:a.sortTime?1:b.sortTime?-1:0);
      replies.forEach(reply=>delete reply.sortTime);
      const tables=[...content.tables,...replies.flatMap(reply=>reply.tables||[])];
      if (subject && latestBody && content.text) return {
        subject, received:formatDate(latest.date.value), body:content.text, intro:content.intro, tables, replies,
        source:"outlook-structured-dom",
        diagnostics:[{key:"diagStructured",detailKey:"diagStructuredDetail",ok:true}]
      };
    }

    // Fallback to semantic reading-pane structures; never use document.title as subject.
    const semanticCards=all('[role="article"], article, [data-testid*="message-card"]',scope).filter(visible);
    const leafCards=semanticCards.filter(card=>!semanticCards.some(other=>other!==card&&card.contains(other)));
    const semanticMessages=leafCards.map(card=>{
      const heading=all("h1,h2,h3,[role=heading]",card).filter(visible).find(el=>text(el));
      const body=all('[id^="UniqueMessageBody"], [role="document"], [aria-label*="Message body"], [aria-label*="メッセージ本文"]',card).filter(visible).find(el=>text(el));
      const date=all("time,[title],[aria-label]",card).filter(visible).map(el=>parseDate(el)).find(Boolean);
      return {subject:text(heading),body,date,content:bodyData(body,{excludeQuotes:true}),embeddedReplies:extractEmbeddedReplies(body)};
    }).filter(message=>message.subject&&message.content.text).sort((a,b)=>(b.date?.time||0)-(a.date?.time||0));
    if(semanticMessages.length>1){
      const latest=semanticMessages[0];
      const replies=semanticMessages.slice(1).flatMap(message=>[{received:message.date?formatDate(message.date.value):"",sortTime:message.date?.time||0,body:message.content.text,tables:message.content.tables},...(message.embeddedReplies||[])]);
      replies.sort((a,b)=>a.sortTime&&b.sortTime?b.sortTime-a.sortTime:a.sortTime?1:b.sortTime?-1:0);
      replies.forEach(reply=>delete reply.sortTime);
      replies.push(...(latest.embeddedReplies||[]));
      return {subject:latest.subject,received:latest.date?formatDate(latest.date.value):"",body:latest.content.text,intro:latest.content.intro,tables:[...latest.content.tables,...replies.flatMap(reply=>reply.tables||[])],replies,source:"outlook-page-fallback",diagnostics:[{key:"diagFallback",detailKey:"diagFallbackDetail",ok:true}]};
    }
    const cards = all('[role="listitem"], [role="article"], article', scope).filter(visible);
    const card = cards[0] || scope;
    const heading = all("h1,h2,h3,[role=heading]", card).filter(visible).find(el => text(el));
    const bodyEl = all('[id^="UniqueMessageBody"], [role="document"], [aria-label*="Message body"], [aria-label*="メッセージ本文"]', card)
      .filter(visible).find(el => text(el)) || bodyEls[0];
    const date = all("time,[title],[aria-label]", card).filter(visible).map(el => ({el,date:parseDate(el)})).find(x=>x.date);
    const subject = text(heading), content = bodyData(bodyEl,{excludeQuotes:true}), body = content.text;
    if (!subject || !body) throw Object.assign(new Error("mailNotFound"),{code:"mailNotFound"});
    return {
      subject, received:date ? formatDate(date.date.value) : "", body, intro:content.intro, tables:content.tables, replies:extractEmbeddedReplies(bodyEl),
      source:"outlook-page-fallback",
      diagnostics:[{key:"diagFallback",detailKey:"diagFallbackDetail",ok:true}]
    };
  }

  function setValue(el,value) {
    if (!el) return false;
    if (el.tagName === "SELECT") {
      const target = norm(value).toLocaleLowerCase();
      const option = [...el.options].find(o => norm(o.text).toLocaleLowerCase() === target);
      if (!option) return false;
      el.value = option.value;
    } else {
      const proto = el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto,"value")?.set;
      if (setter) setter.call(el,value); else el.value = value;
    }
    el.dispatchEvent(new Event("input",{bubbles:true}));
    el.dispatchEvent(new Event("change",{bubbles:true}));
    return true;
  }
  function selectChoice(el,value) {
    if (!norm(value)) return {ok:false,detailKey:"emptySetting"};
    if (!el) return {ok:false,detailKey:"noControl"};
    if (el.tagName !== "SELECT") return {ok:false,detailKey:"notSelect"};
    const target = norm(value).toLocaleLowerCase();
    const option = [...el.options].find(o => norm(o.text).toLocaleLowerCase() === target);
    if (!option) return {ok:false,detailKey:"noOption",value};
    el.value = option.value;
    el.dispatchEvent(new Event("input",{bubbles:true}));
    el.dispatchEvent(new Event("change",{bubbles:true}));
    const actual = norm(el.options[el.selectedIndex]?.text);
    return {ok:actual.toLocaleLowerCase()===target,value:actual};
  }
  function labelControl(labelText) {
    const label = [...document.querySelectorAll("label")].find(el=>norm(el.innerText).includes(labelText));
    return label ? (label.htmlFor ? document.getElementById(label.htmlFor) : label.parentElement?.querySelector("input,select,textarea")) : null;
  }
  function optionsOf(el) {
    return [...(el?.options||[])].map(o=>norm(o.text)).filter(Boolean).filter(x=>!/(请选择|選択してください|---)/.test(x));
  }
  function isIssueNew() {
    return location.pathname.endsWith("/new") || location.pathname.includes("/issues/new") ||
      !!document.querySelector("#issue_subject,input[name='issue[subject]']");
  }
  function readRedmineOptions() {
    if (!location.hostname.includes("redmine-skgd3")) fail("notRedmine");
    if (!isIssueNew()) fail("openNew");
    const project = text(document.querySelector("#content h2"));
    const importance=document.querySelector("#issue_custom_field_values_24");
    const priority=document.querySelector("#issue_priority_id");
    return {
      ok:true, project,
      assignees:optionsOf(document.querySelector("#issue_assigned_to_id")),
      importanceOptions:optionsOf(importance||priority),
      priorities:optionsOf(priority),
      trackers:optionsOf(document.querySelector("#issue_tracker_id"))
    };
  }
  const wait = ms => new Promise(resolve=>setTimeout(resolve,ms));
  async function waitFor(condition,timeout=5000){
    const until=Date.now()+timeout;
    while(Date.now()<until){if(condition())return true;await wait(100);}
    return false;
  }
  function readCcIssue(){
    if(!location.hostname.includes("redmine-skgd3")||location.hostname.includes("-local")) fail("ccExternalOnly");
    const match=location.pathname.match(/\/issues\/(\d+)\/?$/);
    if(!match) fail("ccIssuePage");
    const subject=text(document.querySelector("#content .issue .subject h3"))||norm(document.querySelector("#issue_subject")?.value);
    const raw=document.querySelector("#issue_description")?.value?.trim();
    const shown=bodyData(document.querySelector("#content .issue .description .wiki")).text;
    const prioritySelect=document.querySelector("#issue_priority_id");
    let priority=prioritySelect?norm(prioritySelect.options[prioritySelect.selectedIndex]?.text):"";
    if(!priority) priority=text(document.querySelector("#content .issue .attributes .priority .value"));
    if(!priority){
      const label=[...document.querySelectorAll("#content .issue .attributes .label")].find(el=>norm(el.innerText).startsWith("優先度"));
      priority=text(label?.nextElementSibling);
    }
    return {ok:true,issue:{id:match[1],url:location.origin+location.pathname,subject,body:raw||shown,priority,bodySource:raw?"原文（記法のまま）":shown?"表示内容から取得":"説明が見つかりません"}};
  }
  async function fillCc(cc){
    if(!location.hostname.includes("redmine-skgd3-local")) fail("ccInternalOnly");
    if(!isIssueNew()) fail("openNew");
    const results=[];
    const add=(key,ok,value="",detailKey="")=>results.push({key,ok,value,detailKey});
    const tracker=document.querySelector("#issue_tracker_id");
    const inquiry=tracker&&[...tracker.options].find(o=>/問い?合わ?せ/.test(o.text));
    if(!inquiry) add("tracker",false,"","ccTrackerMissing");
    else if(tracker.value===inquiry.value) add("tracker",true,norm(inquiry.text));
    else {
      tracker.value=inquiry.value;
      tracker.dispatchEvent(new Event("input",{bubbles:true}));
      tracker.dispatchEvent(new Event("change",{bubbles:true}));
      await waitFor(()=>document.querySelector("#issue_tracker_id")!==tracker,5000);
      await wait(300);
      add("tracker",document.querySelector("#issue_tracker_id")?.value===inquiry.value,norm(inquiry.text));
    }
    const id=String(cc.ccId||"").trim();
    const subject="【コールセンタ】"+norm(cc.ccSubject)+"（外部：#"+id+"）";
    add("subject",setValue(document.querySelector("#issue_subject,input[name='issue[subject]']"),subject),subject);
    add("description",setValue(document.querySelector("#issue_description,textarea[name='issue[description]']"),(cc.ccBody||"").replace(/\s+$/,"")),"外部チケットの説明");
    const assignee=selectChoice(document.querySelector("#issue_assigned_to_id"),cc.assignee);
    add("assignee",assignee.ok,assignee.value||cc.assignee,assignee.detailKey);
    const importance=cc.importance?.trim()||"普通";
    let level=selectChoice(document.querySelector("#issue_custom_field_values_24"),importance);
    if(!level.ok) level=selectChoice(document.querySelector("#issue_priority_id"),importance);
    add("priority",level.ok,level.value||importance,level.detailKey);
    const extPriority=norm(cc.ccPriority);
    if(extPriority){
      const base=extPriority.replace(/[＋+－\-−]+$/g,"");
      let mapped=selectChoice(document.querySelector("#issue_priority_id"),extPriority);
      if(!mapped.ok&&base!==extPriority) mapped=selectChoice(document.querySelector("#issue_priority_id"),base);
      add("externalPriority",mapped.ok,mapped.value||base,mapped.detailKey);
    }else add("externalPriority",false,"","emptySetting");
    const start=document.querySelector("#issue_start_date")?.value;
    const due=/^\d{4}-\d{2}-\d{2}$/.test(start||"")?new Date(start+"T00:00"):new Date();
    const requestedDays=parseInt(cc.dueDays,10);
    const days=Number.isFinite(requestedDays)&&requestedDays>=0?Math.min(365,requestedDays):1;
    due.setDate(due.getDate()+days);
    const dueValue=due.getFullYear()+"-"+String(due.getMonth()+1).padStart(2,"0")+"-"+String(due.getDate()).padStart(2,"0");
    const dueEl=document.querySelector("#issue_due_date")||document.querySelector("#issue_custom_field_values_23");
    add("due",setValue(dueEl,dueValue),dueValue,dueEl?"":"dueMissing");
    const url=cc.ccUrl||("https://redmine-skgd3.housei-inc.com/issues/"+id);
    const relation=[...document.querySelectorAll("input,textarea")].find(el=>/external|related/i.test((el.id||"")+" "+(el.name||"")+" "+(el.placeholder||"")))||labelControl("関連外部Redmineチケット");
    add("relation",!!url&&setValue(relation,url),url,url?"":"linkMissing");
    const watcherNames=(cc.watchers||"").split(/\r?\n|[,，]/).map(norm).filter(Boolean);
    const owner=norm(cc.assignee);
    if(owner&&!watcherNames.some(n=>n.replace(/\s/g,"")===owner.replace(/\s/g,""))) watcherNames.push(owner);
    results.push(...await setWatchers(watcherNames));
    return {ok:true,results};
  }
  async function setWatchers(rawNames) {
    const names = [...new Set(rawNames.map(norm).filter(Boolean))];
    if(!names.length) return [{key:"watcher",ok:false,detailKey:"emptySetting"}];
    const found = new Set();
    const scan = () => {
      const boxes = [...document.querySelectorAll('#users_for_watcher input[type="checkbox"],#watchers_inputs input[type="checkbox"],[role="dialog"] input[type="checkbox"]')];
      for (const box of boxes) {
        const label = [box.getAttribute("aria-label"),box.title,...(box.labels?[...box.labels].map(x=>x.innerText):[]),
          box.closest("label")?.innerText,box.parentElement?.innerText].filter(Boolean).join(" ").replace(/\s+/g,"");
        const who = names.find(name=>label.includes(name.replace(/\s+/g,"")));
        if (who) { if (!box.checked) box.click(); found.add(who); }
      }
    };
    const inForm=name=>{
      const area=document.querySelector("#watchers_inputs");
      if(!area) return found.has(name);
      return [...area.querySelectorAll('input[type="checkbox"]')].some(box=>box.checked&&
        (box.closest("label")?.innerText||box.parentElement?.innerText||"").replace(/\s+/g,"").includes(name.replace(/\s+/g,"")));
    };
    scan();
    for(let attempt=0;attempt<2&&names.some(name=>!inForm(name));attempt++){
      const picker=[...document.querySelectorAll('a[href*="/watchers/new"],a,button')].find(el=>
        /ウォッチャーを検索して追加|watcher/i.test(norm(el.innerText)+" "+(el.getAttribute("aria-label")||"")));
      if(!picker) break;
      const before=document.querySelector("#users_for_watcher");
      picker.click();
      await waitFor(()=>{const list=document.querySelector("#users_for_watcher");return list&&list!==before;},15000);
      await wait(250);
      scan();
      const dialog=document.querySelector("#new-watcher-form,[role=dialog],.ui-dialog")||document;
      const add=[...dialog.querySelectorAll("button,input[type=submit],a")].find(el=>/^(追加|Add)$/.test(norm(el.innerText||el.value)));
      if(add&&found.size){
        add.click();
        await waitFor(()=>[...found].every(inForm),15000);
        await wait(250);
      }
    }
    return names.map(name=>{const ok=inForm(name);return {key:"watcher",ok,value:name,detailKey:ok?"watcherAdded":"watcherMissing"};});
  }
  async function fillRedmine(type,draft) {
    if (!location.hostname.includes("redmine-skgd3")) fail("notRedmine");
    if (!isIssueNew()) fail("openNew");
    const internal = type==="internal";
    const subject = norm(draft.subject)+(internal&&draft.externalId.trim()?"（外部#"+draft.externalId.trim()+"）":"");
    const description = draft.description !== undefined ? draft.description : ("受信時間："+draft.received.trim()+"\n"+draft.body);
    const results=[];
    const add=(key,ok,value,detailKey,days)=>results.push({ok,key,value:value||"",detailKey:detailKey||"",days});
    const title=document.querySelector("#issue_subject,input[name='issue[subject]']");
    const desc=document.querySelector("#issue_description,textarea[name='issue[description]']");
    add("subject",setValue(title,subject),subject);
    add("description",setValue(desc,description),"",draft.description===undefined?"receiveAdded":"");
    const assignee=selectChoice(document.querySelector("#issue_assigned_to_id")||labelControl("担当者"),draft.assignee);
    add("assignee",assignee.ok,assignee.value||draft.assignee,assignee.detailKey);
    let priority=selectChoice(document.querySelector("#issue_custom_field_values_24")||labelControl("重要度"),draft.priority);
    if (!priority.ok) priority=selectChoice(document.querySelector("#issue_priority_id"),draft.priority);
    add("priority",priority.ok,priority.value||draft.priority,priority.detailKey);
    const hasDays=String(draft.dueDays||"").trim()!=="";
    const days=Math.max(0,Math.min(365,parseInt(draft.dueDays,10)||0));
    const date=new Date(); date.setDate(date.getDate()+days);
    const dueValue=date.getFullYear()+"-"+String(date.getMonth()+1).padStart(2,"0")+"-"+String(date.getDate()).padStart(2,"0");
    const due=document.querySelector("#issue_custom_field_values_23")||labelControl("対応目途");
    const dueOk=hasDays&&setValue(due,dueValue);
    add("due",dueOk,hasDays?dueValue:"",!hasDays?"emptySetting":dueOk?"":"dueMissing",hasDays?days:undefined);
    if (internal) {
      let rel=[...document.querySelectorAll("input,textarea")].find(el=>/external|related/i.test((el.id||"")+" "+(el.name||"")+" "+(el.placeholder||"")));
      if (!rel) rel=labelControl("関連外部Redmineチケット");
      const relationOk=!!draft.externalUrl&&setValue(rel,draft.externalUrl);
      add("relation",relationOk,draft.externalUrl,!draft.externalUrl?"linkMissing":relationOk?"":"noControl");
    }
    const watchers=(draft.watchers||"").split(/\r?\n|[,，]/);
    results.push(...await setWatchers(watchers));
    return {ok:true,results};
  }
  chrome.runtime.onMessage.addListener((message,_sender,sendResponse)=>{
    (async()=>{
      try {
        language=message.language||"zh";
        if(message.command==="EXTRACT_MAIL") sendResponse({ok:true,mail:extractMail()});
        else if(message.command==="READ_REDMINE_OPTIONS") sendResponse(readRedmineOptions());
        else if(message.command==="READ_CC_ISSUE") sendResponse(readCcIssue());
        else if(message.command==="FILL_CC") sendResponse(await fillCc(message.cc||{}));
        else if(message.command==="FILL_REDMINE") sendResponse(await fillRedmine(message.type,message.draft));
        else sendResponse({ok:false,code:"unknown",error:msg("unknown")});
      } catch(e) { sendResponse({ok:false,code:e.code||e.message,error:e.code?msg(e.code):e.message}); }
    })();
    return true;
  });
})();
