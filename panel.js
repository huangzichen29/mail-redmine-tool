const $ = id => document.getElementById(id);
const DEFAULT_CONFIG = {
  descriptionFormat: "受信時間：{{received}}\n{{body}}",
  replySeparator: "\n\n------\n\n",
  replyFormat: "受信時間：{{received}}\n\n{{body}}",
  includeReplies: true,
  templates: [{
    id: "spnet",
    name: {zh:"SPNET Pro 问卷", ja:"SPNET Pro アンケート", en:"SPNET Pro questionnaire"},
    matchAny: ["SPNET Pro操作研修アンケート", "フォーム投稿／回答", "カードが生成されました"],
    minFieldMatches: 4,
    fields: [
      {key:"都道府県名", label:"都道府県名"},
      {key:"名前/姓", label:"名前/姓"},
      {key:"名前/名", label:"名前/名"},
      {key:"名前（フリガナ）/セイ", label:"名前（フリガナ）/セイ"},
      {key:"名前（フリガナ）/メイ", label:"名前（フリガナ）/メイ"},
      {key:"携帯電話番号", label:"携帯電話番号"},
      {key:"メールアドレス", label:"メールアドレス"},
      {key:"SPNET Proの操作方法・手順についての質問・ご意見", label:"SPNET Proの操作方法・手順についての質問・ご意見"},
      {key:"質問・ご意見を入力してください。", label:"質問・ご意見を入力してください。"}
    ],
    fieldFormat: "【{{label}}】\n{{value}}",
    bodyFormat: "{{fields}}",
    separator: "\n\n",
    omitEmpty: true,
    omitValues: []
  }]
};
const I18N = {
  zh: {
    title:"邮件 ↔ Redmine转记工具",ready:"点击提取当前邮件，或打开 Redmine 新建票页面。",mailTab:"邮件转记",callCenterTab:"コールセンター",mailRedmineSection:"邮件票 Redmine 字段",ccRedmineSection:"コールセンター票 Redmine 字段",ccAssignee:"担当者（コールセンター）",ccDueDays:"対応目途天数（コールセンター）",ccImportance:"重要度（コールセンター）",ccWatchers:"ウォッチャー（コールセンター）",ccExternalId:"外部票号（コールセンター）",ccExternalUrl:"相关外部票链接（コールセンター）",mailRememberHelp:"邮件票的 Redmine 字段单独保存。",ccRememberHelp:"コールセンター票的 Redmine 字段单独保存。",readOptions:"读取当前 Redmine 新建票页的可选值",readOptionsHelp:"请先打开本项目的 Redmine 新建票页面，再读取担当者和重要度候选项；候选仅作输入建议。",ccReadOptionsHelp:"请先打开内部项目的 Redmine 新建票页面，再读取担当者、重要度和优先度候选项；候选仅作输入建议。",optionsDoneProject:"已读取项目“{project}”的候选值；可通过输入建议选择，也可手动填写。",optionsDoneNoProject:"已读取当前新建票页的候选值；可通过输入建议选择，也可手动填写。",ccSection:"コールセンターチケット（检查、编辑）",ccRead:"读取当前外部票",ccFill:"转写内部コールセンター票",ccPriority:"外部票优先度",ccSubject:"外部票标题",ccBody:"外部票说明",ccHelp:"请先在外部 Redmine 打开目标票并读取，再切换到内部 Redmine 新建票页面转记。",urlHelp:"修改票号会更新链接末尾的编号；链接域名和前缀可以直接编辑。",descriptionPreview:"Redmine 説明预览（实际转写内容）",extract:"提取当前邮件",
    mailSection:"邮件内容（可检查、编辑）",subject:"邮件标题",received:"收件时间",bodyFormat:"正文格式",autoTemplate:"自动识别",
    optionsCount:"候选项 {count} 个。",mailConversation:"读取到最新邮件及 {n} 封较早回复；请检查合并后的正文。",
    ordinaryTemplate:"普通邮件（保留段落/列表/表格）",reformat:"按所选模板重新排版",body:"邮件正文",redmineSection:"Redmine 字段设置",
    assignee:"担当者",dueDays:"対応目途（几天后）",priority:"重要度",watchers:"ウォッチャー（每行一人）",externalId:"外部票号（内部票标题追加）",
    externalUrl:"相关外部 Redmine 票链接",fillExternal:"转写外部票",fillInternal:"转写内部票",
    manualSubmit:"只填写 Redmine 草稿，不会提交。请核对页面后手动提交。",settings:"设置",close:"关闭",language:"语言",
    templateConfig:"邮件模板配置（JSON）",templateHelp:"每个模板可用 matchAny 匹配关键词，fields 可用 key 提取表格字段，或用 pattern 正则提取正文。fieldFormat 支持 {{label}}/{{value}}；bodyFormat 可组合固定文字和 {{intro}}/{{fields}}/{{body}}。descriptionFormat 控制 Redmine 説明。conversationFormat 可用 replySeparator、replyFormat、includeReplies 调整多封对话邮件的分隔线、回信格式和是否包含回信。replyFormat 支持 {{received}} 与 {{body}}。",
    descriptionPreview:"Redmine 説明预览（实际转写内容）",
    rememberHelp:"担当者、対応目途、重要度和ウォッチャー会自动记忆为下次默认值。",
    resetTemplates:"恢复内置模板",exportTemplates:"导出配置",saveSettings:"保存设置",settingsSaved:"设置已保存。",invalidJson:"模板 JSON 无效：",
    invalidSchema:"模板需要包含 templates 数组，以及每个模板的 id、name、fields 和 fieldFormat。",
    noMail:"请先提取一封邮件。",confirmReformat:"将从已保存的原始提取内容重新生成正文，并覆盖当前正文编辑。继续吗？",
    noFields:"模板未匹配到字段。请检查字段映射或选择普通邮件格式。",reformatDone:"正文已按所选模板重新生成。",
    extracting:"正在读取当前 Outlook 邮件…",mailStructured:"已从 Outlook 页面提取。请核对最新回复正文和收件时间。",
    mailFallback:"已使用页面解析。请重点核对标题、最新时间和正文。",readOptionsBusy:"正在读取当前 Redmine 表单选项…",
    optionsDone:"已读取本项目选项。可从输入建议中选择，也可直接编辑。",transferBusy:"正在填写 Redmine 草稿…",
    needSubject:"请填写邮件标题。",needReceived:"请填写收件时间。",needBody:"请填写邮件正文。",
    transferFail:"转写失败。",transferPartial:"有 {n} 项未确认；请查看结果并手动补充。",transferDone:"字段已填写，请核对 Redmine 页面后手动提交。",
    noTab:"没有可操作的当前标签页。",pageDisconnected:"当前页面未连接。请刷新 Outlook/Redmine 页面，再试一次。",
    resultSubject:"題名",resultDescription:"説明",resultAssignee:"担当者",resultPriority:"重要度",resultDue:"対応目途",resultTracker:"トラッカー",resultExternalPriority:"外部優先度",
    resultRelation:"関連外部Redmineチケット",resultWatcher:"ウォッチャー",resultReadAssignees:"担当者选项",resultReadPriorities:"重要度选项",
    detailNoControl:"未找到控件",detailNotSelect:"不是下拉选项",detailNoOption:"页面没有该选项",detailEmptySetting:"尚未设置",detailCcTrackerMissing:"跟踪器中没有“问合せ”选项",
    detailDueMissing:"未找到対応目途字段",detailWatcherAdded:"已添加",detailWatcherMissing:"未找到或未确认",detailLinkMissing:"请填写外部票链接",detailReceiveAdded:"说明栏已按模板格式生成",detailDue:"{n} 天后：{value}",
    diagStructured:"Outlook 邮件结构",diagStructuredDetail:"标题和时间已匹配；请检查正文引用内容",
    diagFallback:"页面解析回退",diagFallbackDetail:"请确认这是最新邮件的标题、收件时间和正文",
    templateNameLabel:"已应用模板",templateOrdinaryName:"普通邮件",
    templateAutoName:"自动识别",templateOrdinaryName:"普通邮件",templateSaved:"模板配置已保存。",templateRestored:"已恢复内置模板。",
    ccReadBusy:"正在读取外部コールセンターチケット…",ccReadDone:"外部票已读取。请检查内容，并在内部 Redmine 页面转写。",ccReadFail:"无法读取票据。请打开外部 Redmine 的 /issues/编号 页面。",ccTransferBusy:"正在填写内部コールセンター票…",needExternalId:"请填写外部票号。",needCcSubject:"请填写外部票标题。",resultCcIssue:"外部票号",resultCcPriority:"外部优先度",resultCcSubject:"外部题名",resultCcBody:"外部说明",
    templateExported:"已导出模板配置。",templateResetConfirm:"将恢复内置模板并覆盖当前配置，继续吗？"
  },
  ja: {
    title:"メール ↔ Redmine転記ツール",ready:"メールを抽出するか、Redmine の新規チケット画面を開いてください。",mailTab:"メール転記",callCenterTab:"コールセンター",mailRedmineSection:"メールチケットの Redmine 項目",ccRedmineSection:"コールセンターチケットの Redmine 項目",ccAssignee:"担当者（コールセンター）",ccDueDays:"対応目途（日数・コールセンター）",ccImportance:"重要度（コールセンター）",ccWatchers:"ウォッチャー（コールセンター）",ccExternalId:"外部チケット番号（コールセンター）",ccExternalUrl:"関連外部チケットURL（コールセンター）",mailRememberHelp:"メールチケット用の Redmine 項目を個別に保存します。",ccRememberHelp:"コールセンターチケット用の Redmine 項目を個別に保存します。",readOptions:"現在の Redmine 新規チケット画面から候補を読み込む",readOptionsHelp:"対象プロジェクトの新規チケット画面を開いてから読み込んでください。担当者と重要度の候補が入力候補に追加されます。",ccReadOptionsHelp:"内部プロジェクトの新規チケット画面で読み込んでください。担当者、重要度、優先度の候補が入力候補に追加されます。",optionsDoneProject:"「{project}」の候補を読み込みました。候補から選ぶか直接入力してください。",optionsDoneNoProject:"現在の新規チケット画面から候補を読み込みました。候補から選ぶか直接入力してください。",ccSection:"コールセンターチケット（確認・編集）",ccRead:"現在の外部チケットを読み込む",ccFill:"内部コールセンターチケットへ転記",ccPriority:"外部チケットの優先度",ccSubject:"外部チケットの件名",ccBody:"外部チケットの説明",ccHelp:"外部 Redmine で対象チケットを開いて読み込み、内部 Redmine の新規チケット画面へ切り替えて転記してください。",urlHelp:"チケット番号を変更するとURL末尾の番号が更新されます。URLのドメインや前半部分は直接編集できます。",descriptionPreview:"Redmine 説明プレビュー（実際に転記する内容）",extract:"現在のメールを抽出",
    mailSection:"メール内容（確認・編集）",subject:"件名",received:"受信日時",bodyFormat:"本文形式",autoTemplate:"自動判定",
    optionsCount:"候補 {count} 件。",mailConversation:"最新メールと過去 {n} 通の返信を読み込みました。結合した本文を確認してください。",
    ordinaryTemplate:"通常メール（段落・リスト・表を保持）",reformat:"選択した形式で本文を再整形",body:"メール本文",redmineSection:"Redmine 項目設定",
    assignee:"担当者",dueDays:"対応目途（何日後）",priority:"重要度",watchers:"ウォッチャー（1行に1名）",externalId:"外部チケット番号（内部件名に追加）",
    externalUrl:"関連する外部 Redmine チケットのURL",fillExternal:"外部チケットへ転記",fillInternal:"内部チケットへ転記",
    manualSubmit:"下書きの入力のみ行います。送信はしません。内容を確認して手動で登録してください。",settings:"設定",close:"閉じる",language:"言語",
    templateConfig:"メールテンプレート設定（JSON）",templateHelp:"matchAny で判定語を設定し、fields は key で表項目、pattern で本文を正規表現抽出できます。fieldFormat は {{label}}/{{value}}、bodyFormat は固定文と {{intro}}/{{fields}}/{{body}} を組み合わせます。descriptionFormat で説明欄を設定できます。replySeparator、replyFormat、includeReplies で複数メールの区切り、返信書式、返信を含めるかを設定できます。replyFormat は {{received}}/{{body}} を使えます。",
    descriptionPreview:"Redmine 説明プレビュー（転記される内容）",
    rememberHelp:"担当者、対応目途、重要度、ウォッチャーは自動保存され、次回の初期値になります。",
    resetTemplates:"標準テンプレートに戻す",exportTemplates:"設定をエクスポート",saveSettings:"設定を保存",settingsSaved:"設定を保存しました。",invalidJson:"テンプレート JSON が無効です：",
    invalidSchema:"templates 配列と、各テンプレートの id、name、fields、fieldFormat が必要です。",
    noMail:"先にメールを抽出してください。",confirmReformat:"保存済みの抽出元から本文を再生成し、現在の編集内容を上書きします。続行しますか？",
    noFields:"テンプレートに一致する項目がありません。項目対応を確認するか、通常メール形式を選択してください。",reformatDone:"選択したテンプレートで本文を再生成しました。",
    extracting:"Outlook のメールを読み込んでいます…",mailStructured:"Outlook のメール構造から抽出しました。最新の返信本文と受信日時を確認してください。",
    mailFallback:"ページ解析を使用しました。件名、最新日時、本文を確認してください。",readOptionsBusy:"Redmine の選択肢を読み込んでいます…",
    optionsDone:"このプロジェクトの選択肢を読み込みました。候補から選ぶか、直接編集してください。",transferBusy:"Redmine の下書きに転記しています…",
    needSubject:"件名を入力してください。",needReceived:"受信日時を入力してください。",needBody:"本文を入力してください。",
    transferFail:"転記に失敗しました。",transferPartial:"{n} 項目を確認できません。結果を確認し、必要に応じて手動で入力してください。",transferDone:"項目を入力しました。内容を確認してから手動で登録してください。",
    noTab:"操作対象のタブが見つかりません。",pageDisconnected:"ページに接続できません。Outlook または Redmine を再読み込みしてください。",
    resultSubject:"件名",resultDescription:"説明",resultAssignee:"担当者",resultPriority:"重要度",resultDue:"対応目途",resultTracker:"トラッカー",resultExternalPriority:"外部優先度",
    resultRelation:"関連外部Redmineチケット",resultWatcher:"ウォッチャー",resultReadAssignees:"担当者の選択肢",resultReadPriorities:"重要度の選択肢",
    detailNoControl:"項目が見つかりません",detailNotSelect:"選択リストではありません",detailNoOption:"選択肢が見つかりません",detailEmptySetting:"未設定",detailCcTrackerMissing:"トラッカーに「問合せ」がありません",
    detailDueMissing:"対応目途の項目が見つかりません",detailWatcherAdded:"追加済み",detailWatcherMissing:"見つからないか確認できません",detailLinkMissing:"外部チケットのURLを入力してください",detailReceiveAdded:"説明欄をテンプレート形式で生成しました",detailDue:"{n} 日後：{value}",
    diagStructured:"Outlook メール構造",diagStructuredDetail:"件名と日時を対応付けました。引用部分を確認してください",
    diagFallback:"ページ解析への切り替え",diagFallbackDetail:"最新メールの件名・受信日時・本文か確認してください",
    templateNameLabel:"適用テンプレート",templateOrdinaryName:"通常メール",
    templateAutoName:"自動判定",templateOrdinaryName:"通常メール",templateSaved:"テンプレート設定を保存しました。",templateRestored:"標準テンプレートに戻しました。",
    ccReadBusy:"外部コールセンターチケットを読み込んでいます…",ccReadDone:"外部チケットを読み込みました。内容を確認し、内部 Redmine で転記してください。",ccReadFail:"チケットを読み込めません。外部 Redmine の /issues/番号 の画面を開いてください。",ccTransferBusy:"内部コールセンターチケットに入力しています…",needExternalId:"外部チケット番号を入力してください。",needCcSubject:"外部チケットの件名を入力してください。",resultCcIssue:"外部チケット番号",resultCcPriority:"外部優先度",resultCcSubject:"外部件名",resultCcBody:"外部説明",
    templateExported:"テンプレート設定をエクスポートしました。",templateResetConfirm:"標準テンプレートで現在の設定を置き換えます。続行しますか？"
  },
  en: {
    title:"Mail ↔ Redmine Transfer Tool",ready:"Extract an email or open a new Redmine issue page.",mailTab:"Email transfer",callCenterTab:"Call center",mailRedmineSection:"Email issue Redmine fields",ccRedmineSection:"Call center Redmine fields",ccAssignee:"Assignee (call center)",ccDueDays:"Due date days (call center)",ccImportance:"Importance (call center)",ccWatchers:"Watchers (call center)",ccExternalId:"External ticket number (call center)",ccExternalUrl:"Related external ticket URL (call center)",mailRememberHelp:"Email issue fields are saved separately.",ccRememberHelp:"Call center issue fields are saved separately.",readOptions:"Read choices from current Redmine new issue",readOptionsHelp:"Open a new issue in the target project first. Assignee and importance choices will be added as input suggestions.",ccReadOptionsHelp:"Read choices from a new issue page in internal Redmine. Assignee, importance, and priority choices become input suggestions.",optionsDoneProject:"Loaded choices from {project}. Select a suggestion or enter a value.",optionsDoneNoProject:"Loaded choices from the current new issue page. Select a suggestion or enter a value.",ccSection:"Call center ticket (review and edit)",ccRead:"Read current external ticket",ccFill:"Transfer call center ticket internally",ccPriority:"External ticket priority",ccSubject:"External ticket subject",ccBody:"External ticket description",ccHelp:"Open the target ticket in external Redmine and read it, then switch to a new issue page in internal Redmine to transfer.",urlHelp:"Changing the ticket number updates the URL suffix. You can edit the domain and URL prefix directly.",descriptionPreview:"Redmine description preview (content to transfer)",extract:"Extract current email",
    mailSection:"Email (review and edit)",subject:"Subject",received:"Received time",bodyFormat:"Body format",autoTemplate:"Automatic",
    optionsCount:"{count} choices loaded.",mailConversation:"Loaded the latest message and {n} earlier replies. Review the combined body.",
    ordinaryTemplate:"Standard email (preserve paragraphs/lists/tables)",reformat:"Reformat with selected template",body:"Email body",redmineSection:"Redmine fields",
    assignee:"Assignee",dueDays:"Due date (days from today)",priority:"Priority",watchers:"Watchers (one per line)",externalId:"External ticket number (added to internal subject)",
    externalUrl:"Related external Redmine ticket URL",fillExternal:"Transfer to external ticket",fillInternal:"Transfer to internal ticket",
    manualSubmit:"Fills the Redmine draft only. It will not submit. Review the page and submit manually.",settings:"Settings",close:"Close",language:"Language",
    templateConfig:"Email template configuration (JSON)",templateHelp:"Use matchAny for detection keywords. In fields, key maps table rows and pattern extracts body text. fieldFormat supports {{label}}/{{value}}. bodyFormat combines literal text with {{intro}}, {{fields}}, and {{body}}. descriptionFormat controls Redmine description. Configure replySeparator, replyFormat, and includeReplies to control conversation separators, reply layout, and whether older messages are included; replyFormat supports {{received}} and {{body}}.",
    descriptionPreview:"Redmine description preview (content to transfer)",
    rememberHelp:"Assignee, due date, priority, and watchers are saved automatically and reused next time.",
    resetTemplates:"Restore built-in template",exportTemplates:"Export configuration",saveSettings:"Save settings",settingsSaved:"Settings saved.",invalidJson:"Invalid template JSON: ",
    invalidSchema:"A templates array is required. Each template needs id, name, fields, and fieldFormat.",
    noMail:"Extract an email first.",confirmReformat:"This regenerates the body from the saved source and replaces your current edits. Continue?",
    noFields:"No fields matched this template. Check the field mappings or select the standard email format.",reformatDone:"Body regenerated with the selected template.",
    extracting:"Reading the current Outlook message…",mailStructured:"Extracted from Outlook message structure. Review the latest reply body and received time.",
    mailFallback:"Used page parsing. Carefully review the subject, latest time, and body.",readOptionsBusy:"Reading choices from the Redmine form…",
    optionsDone:"Loaded choices for this project. Choose a suggestion or edit a value.",transferBusy:"Filling the Redmine draft…",
    needSubject:"Enter a subject.",needReceived:"Enter a received time.",needBody:"Enter an email body.",
    transferFail:"Transfer failed.",transferPartial:"{n} item(s) could not be confirmed. Review the results and fill them manually.",transferDone:"Fields filled. Review the Redmine page and submit manually.",
    noTab:"There is no active tab to operate on.",pageDisconnected:"The page is not connected. Reload Outlook or Redmine and try again.",
    resultSubject:"Subject",resultDescription:"Description",resultAssignee:"Assignee",resultPriority:"Priority",resultDue:"Due date",resultTracker:"Tracker",resultExternalPriority:"External priority",
    resultRelation:"Related external Redmine ticket",resultWatcher:"Watcher",resultReadAssignees:"Assignee choices",resultReadPriorities:"Priority choices",
    detailNoControl:"Control not found",detailNotSelect:"Not a select control",detailNoOption:"Option not found",detailEmptySetting:"Not configured",detailCcTrackerMissing:"The tracker list has no Inquiry option",
    detailDueMissing:"Due date field not found",detailWatcherAdded:"Added",detailWatcherMissing:"Not found or not confirmed",detailLinkMissing:"Enter the external ticket URL",detailReceiveAdded:"Description generated with the configured format",detailDue:"In {n} day(s): {value}",
    diagStructured:"Outlook message structure",diagStructuredDetail:"Subject and time were paired; review quoted content",
    diagFallback:"Page parsing fallback",diagFallbackDetail:"Confirm this is the latest message subject, received time, and body",
    templateNameLabel:"Applied template",templateOrdinaryName:"Standard email",
    templateAutoName:"Automatic",templateOrdinaryName:"Standard email",templateSaved:"Template configuration saved.",templateRestored:"Built-in template restored.",
    ccReadBusy:"Reading external call center ticket…",ccReadDone:"External ticket read. Review it and transfer on the internal Redmine page.",ccReadFail:"Could not read the ticket. Open an external Redmine /issues/number page.",ccTransferBusy:"Filling the internal call center issue…",needExternalId:"Enter the external ticket number.",needCcSubject:"Enter the external ticket subject.",resultCcIssue:"External ticket number",resultCcPriority:"External priority",resultCcSubject:"External subject",resultCcBody:"External description",
    templateExported:"Template configuration exported.",templateResetConfirm:"Restore the built-in template and replace the current configuration?"
  }
};

let state={language:"zh",templates:DEFAULT_CONFIG,preferences:{mail:{},callCenter:{}},mailSource:null};
const translate=(key,params={})=>{
  let text=(I18N[state.language]||I18N.zh)[key]||I18N.zh[key]||key;
  for(const [k,v] of Object.entries(params)) text=text.replaceAll("{"+k+"}",String(v));
  return text;
};
const setStatus=key=>{$("status").textContent=translate(key);};

function applyLanguage(){
  document.documentElement.lang=state.language==="zh"?"zh-CN":state.language;
  document.title=translate("title");
  document.querySelectorAll("[data-i18n]").forEach(el=>{const key=el.dataset.i18n;el.textContent=translate(key);});
  document.querySelectorAll("[data-i18n-title]").forEach(el=>{const value=translate(el.dataset.i18nTitle);el.title=value;el.setAttribute("aria-label",value);});
  $("received").placeholder=state.language==="ja"?"YYYY/MM/DD (日) HH:MM":state.language==="en"?"YYYY/MM/DD (Sun) HH:MM":"YYYY/MM/DD (日) HH:MM";
}
function templateName(template){
  if(typeof template.name==="string") return template.name;
  return template.name?.[state.language]||template.name?.en||template.id;
}
function configureTemplateChoices(selected="auto"){
  const select=$("template");
  const auto=select.querySelector('[value="auto"]'), ordinary=select.querySelector('[value="ordinary"]');
  select.replaceChildren(auto,ordinary);
  for(const template of state.templates.templates||[]){
    const option=document.createElement("option");option.value=template.id;option.textContent=templateName(template);select.appendChild(option);
  }
  select.value=[...select.options].some(o=>o.value===selected)?selected:"auto";
}
function applyStaticTranslations(){
  applyLanguage();
  $("settingsDialog").querySelectorAll("[data-i18n]").forEach(el=>{el.textContent=translate(el.dataset.i18n);});
  $("language").value=state.language;
  configureTemplateChoices($("template").value||"auto");
}
function validConfig(config){
  if(!config||!Array.isArray(config.templates)) return false;
  if((config.replySeparator!==undefined&&typeof config.replySeparator!=="string")||(config.replyFormat!==undefined&&typeof config.replyFormat!=="string")||(config.includeReplies!==undefined&&typeof config.includeReplies!=="boolean")) return false;
  const ids=new Set();
  return config.templates.every(t=>{
    if(!t||typeof t.id!=="string"||!t.id||ids.has(t.id)||!t.name||!Array.isArray(t.fields)||typeof t.fieldFormat!=="string"||!t.fields.length) return false;
    ids.add(t.id);
    return t.fields.every(f=>f&&((typeof f.key==="string"&&f.key)||(typeof f.pattern==="string"&&f.pattern))&&typeof (f.label||f.key||f.id||"")==="string"&&(!f.pattern||(()=>{try{new RegExp(f.pattern,f.flags||"m");return true}catch{return false}})()))&&t.fieldFormat.includes("{{value}}")&&(t.bodyFormat===undefined||typeof t.bodyFormat==="string")&&(t.descriptionFormat===undefined||typeof t.descriptionFormat==="string")&&(t.replySeparator===undefined||typeof t.replySeparator==="string")&&(t.replyFormat===undefined||typeof t.replyFormat==="string")&&(t.includeReplies===undefined||typeof t.includeReplies==="boolean");
  });
}
function prefsFromForm(kind){
  if(kind==="callCenter") return {assignee:$("ccAssignee").value,dueDays:$("ccDueDays").value,priority:$("ccImportance").value,watchers:$("ccWatchers").value,externalId:$("ccId").value,externalUrl:$("ccUrl").value};
  return {assignee:$("mailAssignee").value,dueDays:$("mailDueDays").value,priority:$("mailPriority").value,watchers:$("mailWatchers").value,externalId:$("externalId").value,externalUrl:$("externalUrl").value};
}
async function saveDraft(){
  state.preferences={mail:prefsFromForm("mail"),callCenter:prefsFromForm("callCenter")};
  const draft={subject:$("subject").value,received:$("received").value,body:$("body").value,description:descriptionText(),template:$("template").value,ccPriority:$("ccPriority").value,ccSubject:$("ccSubject").value,ccBody:$("ccBody").value};
  await chrome.storage.local.set({productDraft:draft,productPreferencesV2:state.preferences,activeToolTab:document.querySelector(".tab-button.active")?.id||"tabMail"});
}
async function initialize(){
  const stored=await chrome.storage.local.get(["productDraft","productPreferences","productPreferencesV2","productSettings","mailSource","activeToolTab"]);
  if(stored.productSettings){
    state.language=stored.productSettings.language||"zh";
    if(validConfig(stored.productSettings.templates)) state.templates=stored.productSettings.templates;
  }
  const legacy=stored.productPreferences||{};
  const saved=stored.productPreferencesV2||{};
  state.preferences={mail:{...legacy,...(saved.mail||{})},callCenter:{...legacy,...(saved.callCenter||{})}};
  const draft=stored.productDraft||{};
  const mailPrefs=state.preferences.mail,ccPrefs=state.preferences.callCenter;
  $("mailAssignee").value=mailPrefs.assignee||"";
  $("mailDueDays").value=mailPrefs.dueDays||"";
  $("mailPriority").value=mailPrefs.priority||"";
  $("mailWatchers").value=mailPrefs.watchers||"";
  $("externalId").value=mailPrefs.externalId||"";
  $("externalUrl").value=mailPrefs.externalUrl||"";
  $("ccAssignee").value=ccPrefs.assignee||"";
  $("ccDueDays").value=ccPrefs.dueDays||"";
  $("ccImportance").value=ccPrefs.priority||"";
  $("ccWatchers").value=ccPrefs.watchers||"";
  $("ccId").value=ccPrefs.externalId||"";
  $("ccUrl").value=ccPrefs.externalUrl||"";
  $("subject").value=draft.subject||"";
  $("received").value=draft.received||"";
  $("body").value=draft.body||"";
  $("ccPriority").value=draft.ccPriority||"";
  $("ccSubject").value=draft.ccSubject||"";
  $("ccBody").value=draft.ccBody||"";
  state.mailSource=stored.mailSource||null;
  $("language").value=state.language;
  configureTemplateChoices(draft.template||"auto");
  applyStaticTranslations();
  bindEvents();
  updateDescriptionPreview();
  setToolTab(stored.activeToolTab||"tabMail");
}

function fieldValues(mail,template){
  const values=new Map();
  for(const rows of mail.tables||[]){
    for(const row of rows){
      if(row.length<2) continue;
      const key=(row[0]||"").replace(/\s+/g," ").trim();
      if(!values.has(key)) values.set(key,(row.slice(1).join(" ")||"").replace(/\r/g,"").split("\n").map(line=>line.replace(/[ \t]+/g," ").trim()).join("\n").replace(/\n{3,}/g,"\n\n").trim());
    }
  }
  for(const line of (mail.body||"").split(/\r?\n/)){
    const match=line.match(/^\|\s*(.*?)\s*\|\s*(.*?)\s*\|?$/);
    if(match&&!values.has(match[1].trim())) values.set(match[1].trim(),match[2].trim());
  }
  return values;
}
function detectTemplate(mail,config){
  const sample=[mail.subject,mail.body,mail.intro,...(mail.tables||[]).flat(2)].join(" ");
  for(const t of config.templates||[]){
    const hits=extractTemplateFields(mail,t).length;
    if((t.matchAny||[]).some(word=>word&&sample.includes(word))||hits>=(t.minFieldMatches||1)) return t;
  }
  return null;
}
function extractTemplateFields(mail,template){
  const values=fieldValues(mail,template);
  return (template.fields||[]).map((field,index)=>{
    let value=field.key?values.get(field.key):"";
    if(field.pattern){
      try{const match=(mail.body||"").match(new RegExp(field.pattern,field.flags||"m"));value=match?(match.groups?.value??match[1]??match[0]):value;}catch{}
    }
    return {field,index,value:String(value||"").trim()};
  }).filter(x=>x.value&&!(template.omitValues||[]).includes(x.value)&&!(template.omitEmpty&& !x.value));
}
function fillFormat(format,values){
  return String(format??"").replace(/\{\{(received|subject|body|intro|fields)\}\}/g,(_m,key)=>values[key]??"");
}
function renderTemplate(mail,template){
  const blocks=[];
  for(const {field,index,value} of extractTemplateFields(mail,template)){
    const key=field.key||field.id||String(index+1), label=field.label||field.key||field.id||key;
    blocks.push(template.fieldFormat.replaceAll("{{label}}",()=>label).replaceAll("{{value}}",()=>value));
  }
  const fields=blocks.join(template.separator===undefined?"\n\n":template.separator);
  return fillFormat(template.bodyFormat===undefined?"{{fields}}":template.bodyFormat,{fields,body:mail.body||"",intro:mail.intro||"",subject:mail.subject||"",received:mail.received||""});
}
function conversationMail(mail,template=null){
  const include=template?.includeReplies??state.templates.includeReplies??true;
  if(!include||!mail.replies?.length) return {...mail,body:mail.body||""};
  const separator=template?.replySeparator??state.templates.replySeparator??"\n\n------\n\n";
  const replyFormat=template?.replyFormat??state.templates.replyFormat??"受信時間：{{received}}\n\n{{body}}";
  const replies=mail.replies.map(reply=>{
    let format=replyFormat;
    if(!reply.received) format=format.replace(/(?:^|\n)[^\n]*\{\{received\}\}[^\n]*(?:\n\n?)/,"\n");
    return fillFormat(format,{received:reply.received||"",body:reply.body||"",subject:mail.subject||"",intro:"",fields:""}).trim();
  });
  return {...mail,body:[mail.body||"",...replies].filter(Boolean).join(separator)};
}
function formatMail(mail,id){
  if(id==="auto"){
    const detected=conversationMail(mail);
    const matched=detectTemplate(detected,state.templates);
    if(matched){const body=renderTemplate(conversationMail(mail,matched),matched);if(body)return {id:matched.id,body};}
    return {id:"ordinary",body:detected.body};
  }
  if(id==="ordinary") return {id,body:conversationMail(mail).body};
  const template=(state.templates.templates||[]).find(t=>t.id===id);
  return template?{id,body:renderTemplate(conversationMail(mail,template),template)}:{id:"ordinary",body:conversationMail(mail).body};
}
function descriptionText(){
  const template=(state.templates.templates||[]).find(t=>t.id===$("template").value);
  const format=template&&template.descriptionFormat!==undefined?template.descriptionFormat:(state.templates.descriptionFormat??"受信時間：{{received}}\n{{body}}");
  return fillFormat(format,{received:$("received").value,subject:$("subject").value,body:$("body").value,intro:state.mailSource?.intro||"",fields:$("body").value});
}
function updateDescriptionPreview(){ $("descriptionPreview").value=descriptionText(); }
function setToolTab(tabId){
  const callCenter=tabId==="tabCallCenter";
  $("mailPanel").hidden=callCenter;
  $("callCenterPanel").hidden=!callCenter;
  $("tabMail").classList.toggle("active",!callCenter);
  $("tabCallCenter").classList.toggle("active",callCenter);
  $("tabMail").setAttribute("aria-selected",String(!callCenter));
  $("tabCallCenter").setAttribute("aria-selected",String(callCenter));
}
function normalizedIssueId(value){return String(value||"").replace(/[０-９]/g,c=>String.fromCharCode(c.charCodeAt(0)-0xFEE0)).replace(/^\s*[#＃]/,"").trim();}
function updateExternalUrl(kind){
  const idField=kind==="callCenter"?"ccId":"externalId",urlField=kind==="callCenter"?"ccUrl":"externalUrl";
  const id=normalizedIssueId($(idField).value);
  if(!/^\d+$/.test(id)) return;
  const current=$(urlField).value.trim();
  const match=current.match(/^(.*\/issues\/)\d+\/?$/i);
  const base=match?match[1]:(/^https?:\/\//i.test(current)?current.replace(/\/+$/g,"")+"/issues/":"https://redmine-skgd3.housei-inc.com/issues/");
  $(urlField).value=base+id;
}
function formrunSubject(){
  const answer=$("body").value.match(/【SPNET Proの操作方法・手順についての質問・ご意見】\s*\n([^\n]*)/);
  const kind=answer?.[1]?.trim()||templateName((state.templates.templates||[]).find(t=>t.id===$("template").value)||{id:$("template").value,name:$("template").value});
  return "[formrun] 【"+kind+"】";
}
function applyTemplateSubject(id){
  if(id==="spnet") $("subject").value=formrunSubject();
  else if($("subject").value.startsWith("[formrun]")) $("subject").value=state.mailSource?.subject||"";
}
function showResults(items){
  const box=$("results");box.replaceChildren();
  for(const item of items||[]){
    const line=document.createElement("div");
    if(item.key){
      line.textContent=(item.ok?"✓ ":"！ ")+translate("result"+item.key[0].toUpperCase()+item.key.slice(1));
      if(item.days!==undefined) line.textContent+=": "+translate("detailDue",{n:item.days,value:item.value});
      else if(item.value) line.textContent+=": "+item.value;
      else if(item.detailKey) line.textContent+=" — "+translate("detail"+item.detailKey[0].toUpperCase()+item.detailKey.slice(1));
    }else if(item.diag){
      line.textContent="✓ "+translate(item.diag)+(item.detail?": "+translate(item.detail):"");
    }else if(item.resultKey==="templateName"){
      line.textContent="✓ "+translate("templateNameLabel")+": "+item.templateName;
    }else if(item.resultKey){
      line.textContent=(item.ok?"✓ ":"！ ")+translate(item.resultKey)+(item.count!==undefined?": "+item.count:"");
    }else line.textContent=(item.ok?"✓ ":"！ ")+(item.label||"")+(item.detail?": "+item.detail:"");
    line.className=item.ok?"result-ok":"result-fail";box.appendChild(line);
  }
}
function setDatalist(id,items){
  const list=$(id);list.replaceChildren();
  for(const value of items||[]){const option=document.createElement("option");option.value=value;list.appendChild(option);}
}
function exportConfig(){
  let content=$("templateConfig").value;
  try{content=JSON.stringify(JSON.parse(content),null,2);}catch{content=JSON.stringify(state.templates,null,2);}
  const blob=new Blob([content],{type:"application/json"});
  const url=URL.createObjectURL(blob),link=document.createElement("a");
  link.href=url;link.download="mail-redmine-templates.json";link.click();URL.revokeObjectURL(url);
}
function bindEvents(){
  const mainInputs=["subject","received","body","template","mailAssignee","mailDueDays","mailPriority","mailWatchers","externalId","externalUrl","ccAssignee","ccDueDays","ccImportance","ccWatchers","ccId","ccUrl","ccPriority","ccSubject","ccBody"];
  let saveTimer=0;
  const queueSave=()=>{updateDescriptionPreview();clearTimeout(saveTimer);saveTimer=setTimeout(()=>saveDraft(),250);};
  mainInputs.forEach(id=>$(id).addEventListener("input",queueSave));
  mainInputs.forEach(id=>$(id).addEventListener("change",()=>{updateDescriptionPreview();saveDraft();}));
  $("externalId").addEventListener("input",()=>{updateExternalUrl("mail");queueSave();});
  $("ccId").addEventListener("input",()=>{updateExternalUrl("callCenter");queueSave();});
  $("tabMail").addEventListener("click",()=>{setToolTab("tabMail");saveDraft();});
  $("tabCallCenter").addEventListener("click",()=>{setToolTab("tabCallCenter");saveDraft();});
  $("openSettings").addEventListener("click",()=>{
    $("language").value=state.language;
    $("templateConfig").value=JSON.stringify(state.templates,null,2);
    $("settingsStatus").textContent="";
    $("settingsDialog").showModal();
  });
  $("closeSettings").addEventListener("click",()=>$("settingsDialog").close());
  $("resetTemplates").addEventListener("click",()=>{
    if(!confirm(translate("templateResetConfirm"))) return;
    $("templateConfig").value=JSON.stringify(DEFAULT_CONFIG,null,2);
    $("settingsStatus").textContent=translate("templateRestored");
  });
  $("exportTemplates").addEventListener("click",exportConfig);
  $("saveSettings").addEventListener("click",async()=>{
    let config;
    try{config=JSON.parse($("templateConfig").value);}catch(e){$("settingsStatus").textContent=translate("invalidJson")+e.message;return;}
    if(!validConfig(config)){$("settingsStatus").textContent=translate("invalidSchema");return;}
    state.language=$("language").value;
    state.templates=config;
    await chrome.storage.local.set({productSettings:{language:state.language,templates:state.templates}});
    updateDescriptionPreview();
    applyStaticTranslations();
    await saveDraft();
    $("settingsStatus").textContent=translate("settingsSaved");
  });
  $("extract").addEventListener("click",async()=>{
    setStatus("extracting");
    try{
      const result=await activePage("EXTRACT_MAIL");
      if(!result?.ok) throw new Error(result?.error||"mailNotFound");
      state.mailSource=result.mail;
      await chrome.storage.local.set({mailSource:state.mailSource});
      $("subject").value=result.mail.subject||"";
      $("received").value=result.mail.received||"";
      const rendered=formatMail(result.mail,"auto");
      $("template").value=rendered.id;
      $("body").value=rendered.body;
      applyTemplateSubject(rendered.id);
      updateDescriptionPreview();
      await saveDraft();
      if(result.mail.replies?.length) $("status").textContent=translate("mailConversation",{n:result.mail.replies.length});
      else setStatus(result.mail.source==="outlook-structured-dom"?"mailStructured":"mailFallback");
      showResults((result.diagnostics||[]).map(d=>({diag:d.key,detail:d.detailKey,ok:true})).concat([
        {resultKey:rendered.id==="ordinary"?"templateOrdinaryName":"templateName",ok:true,
          templateName:templateName((state.templates.templates||[]).find(t=>t.id===rendered.id)||{id:rendered.id,name:rendered.id})}
      ]));
    }catch(e){setStatus(e.message);}
  });
  $("reformat").addEventListener("click",async()=>{
    if(!state.mailSource){setStatus("noMail");return;}
    if(!confirm(translate("confirmReformat"))) return;
    const rendered=formatMail(state.mailSource,$("template").value);
    if(!rendered.body){setStatus("noFields");return;}
    $("body").value=rendered.body;
    updateDescriptionPreview();
    applyTemplateSubject(rendered.id);
    await saveDraft();
    setStatus("reformatDone");
  });
  async function readOptionsFor(kind){
    setStatus("readOptionsBusy");
    try{
      const result=await activePage("READ_REDMINE_OPTIONS");
      if(!result?.ok) throw new Error(result?.error||"notRedmine");
      if(kind==="callCenter"){
        setDatalist("ccAssigneeOptions",result.assignees);
        setDatalist("ccImportanceOptions",result.importanceOptions);
        setDatalist("ccExternalPriorityOptions",result.priorities);
      }else{
        setDatalist("mailAssigneeOptions",result.assignees);
        setDatalist("mailPriorityOptions",result.importanceOptions);
      }
      const counts=[(result.assignees||[]).length,(result.importanceOptions||[]).length,...(kind==="callCenter"?[(result.priorities||[]).length]:[])];
      const project=result.project?translate("optionsDoneProject",{project:result.project}):translate("optionsDoneNoProject");
      $("status").textContent=project+" "+translate("optionsCount",{count:counts.reduce((a,b)=>a+b,0)});
      showResults([
        {resultKey:"resultReadAssignees",ok:!!result.assignees?.length,count:(result.assignees||[]).length},
        {resultKey:"resultReadPriorities",ok:!!(kind==="callCenter"?result.priorities?.length:result.importanceOptions?.length),count:(kind==="callCenter"?result.priorities||[]:result.importanceOptions||[]).length}
      ]);
    }catch(e){setStatus(e.message);}
  }
  $("mailReadOptions").addEventListener("click",()=>readOptionsFor("mail"));
  $("ccReadOptions").addEventListener("click",()=>readOptionsFor("callCenter"));
  async function transfer(type){
    await saveDraft();
    const draft={subject:$("subject").value,received:$("received").value,body:$("body").value,description:descriptionText(),...prefsFromForm("mail")};
    if(!draft.subject.trim()){setStatus("needSubject");$("subject").focus();return;}
    if(!draft.received.trim()){setStatus("needReceived");$("received").focus();return;}
    if(!draft.body.trim()){setStatus("needBody");$("body").focus();return;}
    setStatus("transferBusy");
    try{
      const result=await activePage("FILL_REDMINE",{type,draft});
      if(!result?.ok) throw new Error(result?.error||"transferFail");
      showResults(result.results);
      const failed=(result.results||[]).filter(item=>!item.ok).length;
      setStatus(failed?translate("transferPartial",{n:failed}):"transferDone");
      if(type==="internal"&&!failed){$("externalId").value="";$("externalUrl").value="";await saveDraft();}
    }catch(e){setStatus(e.message);}
  }
  $("fillExternal").addEventListener("click",()=>transfer("external"));
  $("fillInternal").addEventListener("click",()=>transfer("internal"));
  $("ccRead").addEventListener("click",async()=>{
    setStatus("ccReadBusy");
    try{
      const result=await activePage("READ_CC_ISSUE");
      if(!result?.ok) throw new Error(result?.error||"ccReadFail");
      $("ccId").value=result.issue.id||"";
      $("ccUrl").value=result.issue.url||"";
      $("ccPriority").value=result.issue.priority||"";
      $("ccSubject").value=result.issue.subject||"";
      $("ccBody").value=result.issue.body||"";
      await saveDraft();
      setToolTab("tabCallCenter");
      setStatus("ccReadDone");
      showResults([
        {key:"ccIssue",ok:!!result.issue.id,value:"#"+result.issue.id},
        {key:"ccPriority",ok:!!result.issue.priority,value:result.issue.priority||""},
        {key:"ccSubject",ok:!!result.issue.subject,value:result.issue.subject||""},
        {key:"ccBody",ok:!!result.issue.body,value:result.issue.bodySource||""}
      ]);
    }catch(e){setStatus(e.message);}
  });
  $("ccFill").addEventListener("click",async()=>{
    const ccPrefs=prefsFromForm("callCenter");
    const id=normalizedIssueId(ccPrefs.externalId);
    if(!/^\d+$/.test(id)){setStatus("needExternalId");$("ccId").focus();return;}
    if(!$("ccSubject").value.trim()){setStatus("needCcSubject");$("ccSubject").focus();return;}
    const cc={...ccPrefs,ccId:id,ccUrl:ccPrefs.externalUrl,ccPriority:$("ccPriority").value,ccSubject:$("ccSubject").value,ccBody:$("ccBody").value,importance:ccPrefs.priority};
    setStatus("ccTransferBusy");
    try{
      const result=await activePage("FILL_CC",{cc});
      if(!result?.ok) throw new Error(result?.error||"transferFail");
      showResults(result.results);
      const failed=(result.results||[]).filter(item=>!item.ok).length;
      setStatus(failed?translate("transferPartial",{n:failed}):"transferDone");
    }catch(e){setStatus(e.message);}
  });
}
async function activePage(command,data={}){
  const tabs=await chrome.tabs.query({active:true,lastFocusedWindow:true});
  if(!tabs[0]?.id) throw new Error(translate("noTab"));
  try{return await chrome.tabs.sendMessage(tabs[0].id,{command,...data,language:state.language});}
  catch{throw new Error(translate("pageDisconnected"));}
}
initialize();



