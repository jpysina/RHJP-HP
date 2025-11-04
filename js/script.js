// 当前加载的语言
let currentLang = 'zh';

// 语言包对象
let langData = {};

// 初始化函数
function init() {
  // 检测语言优先级：1. 本地存储的用户偏好 2. 默认使用日文
  const savedLang = localStorage.getItem('preferredLanguage');
  
  if (savedLang) {
    // 优先使用用户保存的语言偏好
    currentLang = savedLang;
    loadLanguageData(currentLang);
  } else {
    // 无论访问者使用何种语言，默认均显示日文
    currentLang = 'ja';
    loadLanguageData(currentLang);
  }
  
  // 设置语言切换事件
  setupLanguageSwitchers();
  
  // 更新活动导航项状态
  updateActiveNavItem();
}

// 综合检测用户语言（浏览器+系统）
function detectUserLang() {
  // 检测浏览器语言
  const navLang = navigator.language || navigator.userLanguage;
  
  // 尝试获取操作系统语言设置（通过浏览器API）
  let osLang = null;
  if (navigator.languages && navigator.languages.length > 0) {
    // 使用首选语言列表中的第一个
    osLang = navigator.languages[0];
  }
  
  // 优先考虑浏览器语言
  const primaryLang = navLang;
  const secondaryLang = osLang;
  
  // 检查是否为支持的语言
  if (primaryLang && primaryLang.startsWith('ja')) return 'ja';
  if (primaryLang && primaryLang.startsWith('en')) return 'en';
  if (secondaryLang && secondaryLang.startsWith('ja')) return 'ja';
  if (secondaryLang && secondaryLang.startsWith('en')) return 'en';
  
  // 检查中文变体
  if (primaryLang && (primaryLang.startsWith('zh') || primaryLang.includes('CN') || primaryLang.includes('TW') || primaryLang.includes('HK') || primaryLang.includes('SG'))) {
    return 'zh';
  }
  if (secondaryLang && (secondaryLang.startsWith('zh') || secondaryLang.includes('CN') || secondaryLang.includes('TW') || secondaryLang.includes('HK') || secondaryLang.includes('SG'))) {
    return 'zh';
  }
  
  return 'zh'; // 默认中文
}

// 基于IP地址检测地理位置和语言
function detectLanguageByIP() {
  return new Promise((resolve, reject) => {
    // 设置超时处理
    const timeoutId = setTimeout(() => {
      reject(new Error('IP检测超时'));
    }, 3000);
    
    // 使用公共IP地理位置API
    // 注意：这是一个免费API，实际生产环境应考虑使用更可靠的付费服务
    fetch('https://ipinfo.io/json')
      .then(response => {
        clearTimeout(timeoutId);
        if (!response.ok) {
          throw new Error('IP信息获取失败');
        }
        return response.json();
      })
      .then(data => {
        const country = data.country;
        console.log('检测到用户所在国家/地区:', country);
        
        // 根据国家/地区确定语言
        // 语言切换规则：当检测到用户所在地区为中国、新加坡或日本时，使用对应地区的语言
        if (country === 'JP') {
          resolve('ja'); // 日本使用日语
        } else if (country === 'CN' || country === 'SG') {
          resolve('zh'); // 中国和新加坡使用中文
        } else {
          resolve('en'); // 其他地区使用英文
        }
      })
      .catch(error => {
        clearTimeout(timeoutId);
        console.warn('IP检测失败，回退到浏览器语言:', error.message);
        reject(error);
      });
  });
}

// 加载语言数据
function loadLanguageData(lang, isIPDetected = false) {
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
      
      // 如果是通过IP地址检测的语言，显示提示信息
      if (isIPDetected) {
        showIPDetectionNotice(lang);
      } else {
        // 移除可能存在的提示信息
        removeIPDetectionNotice();
      }
    })
    .catch(error => {
      console.error('语言加载错误:', error);
      // 如果加载失败，使用默认语言
      if (lang !== 'zh') {
        loadLanguageData('zh', isIPDetected);
      }
    });
}

// 显示IP地址检测提示信息
function showIPDetectionNotice(lang) {
  // 先移除可能存在的提示
  removeIPDetectionNotice();
  
  // 创建提示容器
  const noticeContainer = document.createElement('div');
  noticeContainer.id = 'ip-language-notice';
  noticeContainer.className = 'ip-language-notice';
  
  // 根据当前语言设置提示内容
  let noticeText;
  let closeText;
  
  switch(lang) {
    case 'zh':
      noticeText = '根据您的IP地址检测到您可能位于中国或新加坡地区，已自动切换为中文显示。';
      closeText = '关闭';
      break;
    case 'ja':
      noticeText = 'お客様のIPアドレスにより日本在住と推定されます。日本語表示に自動的に切り替えられました。';
      closeText = '閉じる';
      break;
    default: // en
      noticeText = 'Based on your IP address, we have automatically switched to English display.';
      closeText = 'Close';
  }
  
  // 设置提示内容
  noticeContainer.innerHTML = `
    <div class="ip-notice-content">
      <span>${noticeText}</span>
      <button class="close-btn" onclick="removeIPDetectionNotice()">${closeText}</button>
    </div>
  `;
  
  // 添加到页面，插入到header之后
  const header = document.querySelector('header');
  if (header && header.nextSibling) {
    header.parentNode.insertBefore(noticeContainer, header.nextSibling);
  } else if (header) {
    header.parentNode.appendChild(noticeContainer);
  } else {
    document.body.insertBefore(noticeContainer, document.body.firstChild);
  }
}

// 移除IP地址检测提示信息
function removeIPDetectionNotice() {
  const notice = document.getElementById('ip-language-notice');
  if (notice) {
    notice.remove();
  }
}

// 将removeIPDetectionNotice添加到window对象，使其可以在HTML中直接调用
window.removeIPDetectionNotice = removeIPDetectionNotice;

// 更新页面内容
function updatePageContent() {
  // 更新品牌信息
  document.querySelector('.brand-name').textContent = langData.brand.name;
  document.querySelector('.brand-full-name').textContent = langData.brand.fullName;
  
  // 更新导航菜单
  document.querySelectorAll('.sidebar-nav a').forEach(link => {
    const langKey = link.dataset.lang;
    if (langKey && langData.nav[langKey]) {
      link.textContent = langData.nav[langKey];
    }
  });
  
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