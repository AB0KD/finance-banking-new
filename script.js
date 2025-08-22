// دالة التحقق من رابط المشاركة في الصفحة الرئيسية
function checkShareToken() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
        // حفظ التوكن في التخزين المحلي للاستخدام لاحقاً
        localStorage.setItem('shareToken', token);
        
        // إخفاء التوكن من عنوان URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // إذا كان المستخدم غير مسجل دخول، توجيه إلى صفحة المشاركة
        if (localStorage.getItem('isLoggedIn') !== 'true') {
            window.location.href = `share.html?token=${token}`;
        }
    }
}

// استدعاء الدالة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    checkShareToken();
    
    // ... الكود الحالي
});

// عناصر التحكم في الوضع الداكن والفاتح
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// التحقق من التفضيل المحفوظ
if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    body.classList.remove('light-mode');
    themeToggle.textContent = '🌙';
} else {
    body.classList.add('light-mode');
    body.classList.remove('dark-mode');
    themeToggle.textContent = '☀️';
}

// تبديل الوضع الداكن/الفاتح
themeToggle.addEventListener('click', () => {
    if (body.classList.contains('light-mode')) {
        body.classList.replace('light-mode', 'dark-mode');
        themeToggle.textContent = '🌙';
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.replace('dark-mode', 'light-mode');
        themeToggle.textContent = '☀️';
        localStorage.setItem('theme', 'light');
    }
});

// تغيير اللغة
const languageSelect = document.getElementById('languageSelect');

// التحقق من اللغة المحفوظة
if (localStorage.getItem('language') === 'en') {
    languageSelect.value = 'en';
    changeLanguage('en');
} else {
    languageSelect.value = 'ar';
    changeLanguage('ar');
}

// تغيير اللغة عند التحديد
languageSelect.addEventListener('change', (e) => {
    changeLanguage(e.target.value);
    localStorage.setItem('language', e.target.value);
});

// دالة تغيير اللغة
async function changeLanguage(lang) {
    try {
        const response = await fetch(`languages/${lang}.json`);
        const translations = await response.json();
        
        // تطبيق الترجمات على جميع العناصر
        document.querySelectorAll('[data-key]').forEach(element => {
            const key = element.getAttribute('data-key');
            if (translations[key]) {
                if (element.tagName === 'INPUT' && element.type === 'button') {
                    element.value = translations[key];
                } else if (element.placeholder) {
                    element.placeholder = translations[key];
                } else {
                    element.textContent = translations[key];
                }
            }
        });
        
        // تغيير اتجاه الصفحة
        if (lang === 'ar') {
            document.documentElement.dir = 'rtl';
            document.documentElement.lang = 'ar';
            document.querySelector('header .container').style.direction = 'rtl';
        } else {
            document.documentElement.dir = 'ltr';
            document.documentElement.lang = 'en';
            document.querySelector('header .container').style.direction = 'ltr';
        }
    } catch (error) {
        console.error('Error loading language file:', error);
    }
}

// محاكاة عملية تسجيل الدخول
document.addEventListener('DOMContentLoaded', function() {
    const loginLink = document.getElementById('loginLink');
    
    // التحقق من حالة تسجيل الدخول
    if (localStorage.getItem('isLoggedIn') === 'true') {
        loginLink.textContent = localStorage.getItem('language') === 'en' ? 'Dashboard' : 'لوحة التحكم';
        loginLink.href = 'dashboard.html';
    } else {
        loginLink.textContent = localStorage.getItem('language') === 'en' ? 'Login' : 'تسجيل الدخول';
        loginLink.href = 'login.html';
    }
    
    // عرض الملفات والصور عند تحميل الصفحة
    displayFilesOnHomepage();
    displayImagesOnHomepage();
});

// دالة مساعدة لتنسيق حجم الملف
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// دالة لعرض الملفات في الصفحة الرئيسية
function displayFilesOnHomepage() {
    // فقط إذا كان المستخدم في الصفحة الرئيسية
    const fileList = document.querySelector('.file-list');
    if (!fileList) return;
    
    const files = fileStorage.getFiles();
    
    // مسح الملفات الافتراضية إذا كانت هناك ملفات مخزنة
    fileList.innerHTML = '';
    
    // إذا لم يكن هناك ملفات، عرض رسالة
    if (files.length === 0) {
        fileList.innerHTML = '<p>لا توجد ملفات متاحة للتحميل بعد</p>';
        return;
    }
    
    // إضافة الملفات المخزنة
    files.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <h3>${file.name}</h3>
            <p>${file.type} - ${file.size}</p>
            <div class="file-actions">
                <button class="download" data-file-index="${index}">تحميل</button>
            </div>
        `;
        fileList.appendChild(fileItem);
    });
    
    // إضافة أحداث التحميل
    document.querySelectorAll('.file-list .download').forEach(button => {
        button.addEventListener('click', function() {
            const index = this.getAttribute('data-file-index');
            const files = fileStorage.getFiles();
            const file = files[index];
            
            // إنشاء رابط تحميل
            const link = document.createElement('a');
            link.href = file.data;
            link.download = file.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    });
}

// دالة لعرض الصور في الصفحة الرئيسية
function displayImagesOnHomepage() {
    // فقط إذا كان المستخدم في الصفحة الرئيسية
    const galleryGrid = document.querySelector('.gallery-grid');
    if (!galleryGrid) return;
    
    const images = fileStorage.getImages();
    
    // مسح الصور الافتراضية إذا كانت هناك صور مخزنة
    if (images.length > 0) {
        galleryGrid.innerHTML = '';
    }
    
    // إضافة الصور المخزنة
    images.forEach((image, index) => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.innerHTML = `
            <img src="${image.data}" alt="${image.name}">
            <div class="image-actions">
                <button class="download" data-image-index="${index}">تحميل</button>
                <button class="view" data-image-index="${index}">عرض</button>
            </div>
        `;
        galleryGrid.appendChild(galleryItem);
    });
    
    // إضافة أحداث التحميل والعرض
    document.querySelectorAll('.gallery-item .download').forEach(button => {
        button.addEventListener('click', function() {
            const index = this.getAttribute('data-image-index');
            const images = fileStorage.getImages();
            const image = images[index];
            
            // إنشاء رابط تحميل
            const link = document.createElement('a');
            link.href = image.data;
            link.download = image.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    });
    
    document.querySelectorAll('.gallery-item .view').forEach(button => {
        button.addEventListener('click', function() {
            const index = this.getAttribute('data-image-index');
            const images = fileStorage.getImages();
            const image = images[index];
            
            // فتح الصورة في نافذة جديدة
            window.open(image.data, '_blank');
        });
    });
}

// تحديث العرض عند تغيير اللغة
languageSelect.addEventListener('change', function() {
    // إعادة تحميل الملفات والصور بعد تغيير اللغة
    setTimeout(() => {
        displayFilesOnHomepage();
        displayImagesOnHomepage();
    }, 100);
});

// دالة التحقق من رابط المشاركة في الصفحة الرئيسية
function checkShareToken() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
        // حفظ التوكن في التخزين المحلي للاستخدام لاحقاً
        localStorage.setItem('shareToken', token);
        
        // إخفاء التوكن من عنوان URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

// استدعاء الدالة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    checkShareToken();
    
    // ... الكود الحالي
});