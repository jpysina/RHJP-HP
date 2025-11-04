// 当前加载的语言
let currentLang = 'zh';

// 语言包对象
let langData = {};

// 初始化函数
function init() {
  // 检测浏览器语言
  const savedLang = localStorage.getItem('preferredLanguage');
  const browserLang = detectBrowserLang();
  currentLang = savedLang || browserLang;
  
  // 加载语言数据
  loadLanguageData(currentLang);
  
  // 设置语言切换事件
  setupLanguageSwitchers();
  
  // 更新活动导航项状态
  updateActiveNavItem();
}

// 检测浏览器语言
function detectBrowserLang() {
  const navLang = navigator.language || navigator.userLanguage;
  if (navLang.startsWith('ja')) return 'ja';
  if (navLang.startsWith('en')) return 'en';
  return 'zh'; // 默认中文
}

// 加载语言数据
function loadLanguageData(lang) {
  // 根据lang参数确定正确的文件路径
  let filePath;
  if (lang === 'zh') {
    filePath = './lang/zh-cn.json'; // 中文使用zh-cn.json
  } else {
    filePath = `./lang/${lang}.json`;
  }
  
  fetch(filePath)  
    .then(response => {
      if (!response.ok) {
        throw new Error('语言文件加载失败');
      }
      return response.json();
    })
    .then(data => {
      langData = data;
      updatePageContent();
      updateLanguageSwitcher(lang);
      updateDocumentLang(lang);
    })
    .catch(error => {
      console.error('语言加载错误:', error);
      // 如果加载失败，使用默认语言
      if (lang !== 'zh') {
        loadLanguageData('zh');
      }
    });
}

// 更新页面内容
function updatePageContent() {
  // 更新品牌信息
  document.querySelector('.brand-name').textContent = langData.brand.name;
  document.querySelector('.brand-full-name').textContent = langData.brand.fullName;
  
  // 更新导航菜单 - 导航链接文本处理已移至侧边栏处理函数
  // 保留基本导航更新逻辑以确保兼容性
  
  // 更新hero区域
  document.querySelector('.hero .badge').textContent = langData.hero.badge;
  document.querySelector('.hero h1').textContent = langData.hero.title;
  document.querySelector('.hero p').textContent = langData.hero.description;
  document.querySelector('.hero .cta').textContent = langData.hero.cta;
  
  // 更新快速服务概览
  document.querySelector('#quickServices h3').textContent = langData.quickServices.title;
  document.querySelector('#quickServices .muted').textContent = langData.quickServices.subtitle;
  const quickServiceList = document.querySelector('#quickServices ul');
  quickServiceList.innerHTML = '';
  langData.quickServices.list.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    quickServiceList.appendChild(li);
  });
  
  // 更新关于我们
  document.querySelector('#about h2').textContent = langData.about.title;
  const aboutContent = document.querySelector('#about .card > p:nth-child(2)');
  const aboutTeam = document.querySelector('#about .card > p:nth-child(3)');
  
  if (aboutContent) aboutContent.textContent = langData.about.description;
  if (aboutTeam) aboutTeam.textContent = langData.about.team;
  
  // 更新服务范围
  document.querySelector('#services h2').textContent = langData.services.title;
  
  // 更新服务卡片内容
  const serviceCards = document.querySelectorAll('#services .card');
  langData.services.categories.forEach((category, index) => {
    if (index < serviceCards.length) {
      const card = serviceCards[index];
      
      // 更新卡片标题和描述
      const h3 = card.querySelector('h3');
      const desc = card.querySelector('p');
      const list = card.querySelector('ul');
      
      if (h3) h3.textContent = category.title;
      if (desc) desc.textContent = category.description;
      
      // 更新服务列表
      if (list && category.list) {
        list.innerHTML = '';
        category.list.forEach(item => {
          const li = document.createElement('li');
          li.textContent = item;
          list.appendChild(li);
        });
      }
    }
  });
  
  // 如果有优势部分
  const advantagesSection = document.querySelector('#advantages');
  if (advantagesSection) {
    document.querySelector('#advantages h2').textContent = langData.advantages.title;
    const advantagesList = document.querySelector('#advantages ul');
    advantagesList.innerHTML = '';
    langData.advantages.list.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      advantagesList.appendChild(li);
    });
  }
  
  // 更新费用表格
  document.querySelector('#fees h2').textContent = langData.fees.title;
  document.querySelector('#fees .muted').textContent = langData.fees.description;
  
  const tableHeader = document.querySelector('#fees thead tr');
  tableHeader.innerHTML = '';
  langData.fees.table.headers.forEach(header => {
    const th = document.createElement('th');
    th.textContent = header;
    tableHeader.appendChild(th);
  });
  
  const tableBody = document.querySelector('#fees tbody');
  tableBody.innerHTML = '';
  langData.fees.table.rows.forEach(row => {
    const tr = document.createElement('tr');
    row.forEach(cell => {
      const td = document.createElement('td');
      td.textContent = cell;
      tr.appendChild(td);
    });
    tableBody.appendChild(tr);
  });
  
  const feeNote = document.querySelector('#fees .card > p:last-child');
  if (feeNote) feeNote.textContent = langData.fees.note;
  
  // 更新新闻
  document.querySelector('#news h2').textContent = langData.news.title;
  const newsContainer = document.querySelector('#news .card');
  const newsItems = newsContainer.querySelectorAll('.news-item');
  
  // 清空并重新添加新闻项
  const existingNewsItems = document.querySelectorAll('.news-item');
  existingNewsItems.forEach(item => item.remove());
  
  langData.news.items.forEach(item => {
    const newsItem = document.createElement('div');
    newsItem.className = 'news-item';
    newsItem.innerHTML = `<div class="small">${item}</div>`;
    newsContainer.appendChild(newsItem);
  });
  
  // 更新联系我们
  document.querySelector('#contact h2').textContent = langData.contact.title;
  document.querySelector('#contact .company-name').textContent = langData.contact.company;
  document.querySelector('#contact .address').textContent = langData.contact.address;
  document.querySelector('#contact .phone').textContent = langData.contact.phone;
  document.querySelector('#contact .email').textContent = langData.contact.email;
  document.querySelector('#contact .hours').textContent = langData.contact.hours;
  document.querySelector('#contact .languages').textContent = langData.contact.languages;
  
  // 更新联系表单
  const contactForm = document.querySelector('#contact form');
  if (contactForm) {
    document.querySelector('#contact h3').textContent = langData.contact.form.title;
    contactForm.querySelector('input[name="name"]').placeholder = langData.contact.form.namePlaceholder;
    contactForm.querySelector('input[name="email"]').placeholder = langData.contact.form.emailPlaceholder;
    contactForm.querySelector('input[name="company"]').placeholder = langData.contact.form.companyPlaceholder;
    contactForm.querySelector('textarea[name="message"]').placeholder = langData.contact.form.messagePlaceholder;
    contactForm.querySelector('button[type="submit"]').textContent = langData.contact.form.submitButton;
    
    // 更新表单提交事件
    contactForm.onsubmit = function(e) {
      e.preventDefault();
      alert(langData.contact.form.thankYouMessage);
    };
  }
  
  // 更新页脚
  document.querySelector('footer .copyright').textContent = langData.footer.copyright;
  document.querySelector('footer .disclaimer').textContent = langData.footer.disclaimer;
  
  // 更新页面标题
  document.title = langData.brand.name + " — " + 
    (langData.nav.services === "Services" ? "Legal Consulting" : 
     langData.nav.services === "サービス" ? "法律相談" : "法律咨询");
  
  // 更新元描述
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.content = langData.brand.name + " — " + 
      (langData.nav.services === "Services" ? "Professional legal and business support for companies and individuals in Japan" : 
       langData.nav.services === "サービス" ? "日本での企業・個人向け専門的な法律・ビジネスサポート" : 
       "专注为在日企业与个人提供法律、签证、税务与合规服务");
  }
}

// 更新语言切换按钮状态
function updateLanguageSwitcher(lang) {
  const buttons = document.querySelectorAll('.language-switcher button');
  buttons.forEach(button => {
    if (button.dataset.lang === lang) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
}

// 更新活动导航项
function updateActiveNavItem() {
  const currentPath = window.location.pathname;
  document.querySelectorAll('.sidebar-nav a').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === currentPath || 
        (currentPath === '/' && link.getAttribute('href') === 'index.html')) {
      link.classList.add('active');
    }
  });
}

// 更新文档语言属性
function updateDocumentLang(lang) {
  document.documentElement.lang = lang;
}

// 设置语言切换器
function setupLanguageSwitchers() {
  const buttons = document.querySelectorAll('.language-switcher button');
  buttons.forEach(button => {
    button.addEventListener('click', function() {
      const lang = this.dataset.lang;
      if (lang !== currentLang) {
        currentLang = lang;
        localStorage.setItem('preferredLanguage', lang);
        loadLanguageData(lang);
        
        // 更新活动导航项状态
        updateActiveNavItem();
      }
    });
  });
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', init);