// قائمة اللانشرات اليدوية (لأنها غير موجودة في Modrinth API)
const LAUNCHERS = [
    { title: "SKLauncher", type: "مكرك / أصلي", icon: "https://skmedix.pl/assets/img/sklauncher/icon.png", url: "https://skmedix.pl/sklauncher/downloads" },
    { title: "TLauncher", type: "مكرك", icon: "https://tlauncher.org/img/tlauncher-logo.png", url: "https://tlauncher.org/" },
    { title: "Prism Launcher", type: "أصلي (احترافي)", icon: "https://prismlauncher.org/favicon.ico", url: "https://prismlauncher.org/download/" },
    { title: "TL Legacy", type: "مكرك (نظيف)", icon: "https://llauncher.ru/wp-content/uploads/2016/04/icon.png", url: "https://llauncher.ru/en/" }
];

class LusmistEngine {
    constructor() {
        this.state = { 
            hits: [], 
            page: 0, 
            query: '', 
            type: '', 
            loading: false, 
            versions: [], 
            selection: {} 
        };
        this.init();
    }

    init() {
        this.fetchData();
        this.bindEvents();
    }

    bindEvents() {
        // إدارة أزرار التصنيفات (مودات، شادرات...)
        document.querySelectorAll('.cat-chip').forEach(chip => {
            chip.onclick = () => {
                if(this.state.loading) return;
                document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.state.type = chip.dataset.type;
                this.resetGrid();
            };
        });

        // إدارة مربع البحث مع تأخير بسيط (Debounce) لتحسين الأداء
        let timer;
        document.getElementById('main-search').oninput = (e) => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                this.state.query = e.target.value;
                this.resetGrid();
            }, 700);
        };

        // التمرير اللانهائي (Infinite Scroll)
        const obs = new IntersectionObserver(entries => {
            if(entries[0].isIntersecting && !this.state.loading && this.state.type !== 'launcher') {
                this.fetchData();
            }
        }, { threshold: 0.1, rootMargin: '300px' });
        obs.observe(document.getElementById('scroll-anchor'));
    }

    async fetchData() {
        if(this.state.loading) return;
        
        // عرض اللانشرات إذا تم اختيار قسم اللانشرات
        const LAUNCHERS = [
    { 
        title: "SKLauncher", 
        type: "اللانشر الأفضل (مكرك + أصلي)", 
        desc: "يتميز بواجهة حديثة ودعم كامل للـ Skins في النسخ المكركة.",
        icon: "https://skmedix.pl/assets/img/sklauncher/icon.png", 
        url: "https://skmedix.pl/sklauncher/downloads" 
    },
    { 
        title: "TLauncher", 
        type: "الأكثر شهرة (مكرك)", 
        desc: "سهل الاستخدام ويوفر وصولاً سريعاً لكل الإصدارات والمودات.",
        icon: "https://tlauncher.org/img/tlauncher-logo.png", 
        url: "https://tlauncher.org/" 
    },
    { 
        title: "Prism Launcher", 
        type: "للمحترفين (أصلي فقط)", 
        desc: "يسمح لك بإدارة مئات المودباكات وفصلها في عوالم مستقلة تماماً.",
        icon: "https://prismlauncher.org/favicon.ico", 
        url: "https://prismlauncher.org/download/" 
    }
];

// دالة العرض المحدثة لإظهار الوصف والصور
renderLaunchers() {
    const grid = document.getElementById('main-grid');
    grid.innerHTML = ""; 
    LAUNCHERS.forEach(l => {
        const card = document.createElement('div');
        card.className = 'card launcher-card'; // أضفنا الكلاس لتمييز التصميم
        card.onclick = () => window.open(l.url);
        card.innerHTML = `
            <div style="background: #1a1a1a; padding: 15px; display: flex; justify-content: center;">
                <img src="${l.icon}" style="width: 80px; height: 80px; object-fit: contain;" onerror="this.src='https://via.placeholder.com/80?text=App'">
            </div>
            <div class="card-body">
                <span class="card-type" style="background:var(--accent); color:#000; padding: 2px 6px; border-radius: 4px;">LAUNCHER</span>
                <div class="card-title" style="margin-top: 10px; font-size: 1rem;">${l.title}</div>
                <div style="font-size: 0.65rem; color: var(--accent); font-weight: bold; margin-bottom: 5px;">${l.type}</div>
                <p style="font-size: 0.65rem; color: var(--text-s); line-height: 1.3;">${l.desc}</p>
            </div>
        `;
        grid.appendChild(card);
    });
    document.getElementById('scroll-anchor').style.display = 'none';
}
سيق الفلتر الخاص بـ Modrinth API
        const filter = this.state.type ? `&facets=[["project_type:${this.state.type}"]]` : "";
        
        try {
            const response = await fetch(`https://api.modrinth.com/v2/search?query=${encodeURIComponent(this.state.query)}${filter}&offset=${offset}&limit=20`);
            const data = await response.json();
            this.renderCards(data.hits);
            this.state.page++;
        } catch(e) {
            console.error("خطأ في جلب البيانات:", e);
        } finally {
            this.state.loading = false;
        }
    }

    renderCards(hits) {
        const grid = document.getElementById('main-grid');
        hits.forEach(hit => {
            const card = document.createElement('div');
            card.className = 'card';
            card.onclick = () => this.openProject(hit.project_id);
            card.innerHTML = `
                <img src="${hit.icon_url || 'https://via.placeholder.com/200'}" class="card-img" alt="icon" loading="lazy">
                <div class="card-body">
                    <span class="card-type">${hit.project_type.toUpperCase()}</span>
                    <div class="card-title">${hit.title}</div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    renderLaunchers() {
        const grid = document.getElementById('main-grid');
        grid.innerHTML = ""; 
        LAUNCHERS.forEach(l => {
            const card = document.createElement('div');
            card.className = 'card launcher-card';
            card.onclick = () => window.open(l.url);
            card.innerHTML = `
                <img src="${l.icon}" class="card-img" style="object-fit:contain; padding:25px;">
                <div class="card-body">
                    <span class="card-type" style="background:#2ecc71; color:#000;">LAUNCHER</span>
                    <div class="card-title">${l.title}</div>
                    <small style="color:var(--text-s); font-size:0.65rem;">${l.type}</small>
                </div>
            `;
            grid.appendChild(card);
        });
        document.getElementById('scroll-anchor').style.display = 'none';
    }

    async openProject(id) {
        document.getElementById('modal-overlay').style.display = 'flex';
        document.body.style.overflow = 'hidden';
        this.resetModal();
        
        try {
            const [p, v] = await Promise.all([
                fetch(`https://api.modrinth.com/v2/project/${id}`).then(r => r.json()),
                fetch(`https://api.modrinth.com/v2/project/${id}/version`).then(r => r.json())
            ]);

            this.state.versions = v;
            document.getElementById('m-title').innerText = p.title;
            document.getElementById('m-img').src = p.icon_url || '';

            // استخراج الإصدارات وتطبيق فلتر الإصدارات الرسمية فقط
            const allVersions = [...new Set(v.flatMap(x => x.game_versions))];
            
            // الفلتر السحري: يقبل فقط الأنماط مثل 1.20 أو 1.16.5 ويحذف السنابشوت
            const gvSet = allVersions
                .filter(gv => /^\d+\.\d+(\.\d+)?$/.test(gv))
                .sort((a,b) => b.localeCompare(a, undefined, {numeric: true}));
            
            // إذا لم يجد إصدارات رسمية (حالة نادرة)، يعرض المتاح لضمان عدم تعطل النافذة
            const displayVersions = gvSet.length > 0 ? gvSet : allVersions.slice(0, 15);

            document.getElementById('gv-grid').innerHTML = displayVersions.map(gv => `
                <div class="opt-btn" onclick="core.selectGV(this, '${gv}')">${gv}</div>
            `).join('');

        } catch(e) {
            console.error("خطأ في جلب تفاصيل المشروع:", e);
            this.closeModal();
        }
    }

    selectGV(btn, gv) {
        document.querySelectorAll('#gv-grid .opt-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.selection.gv = gv;

        // تصفية المشغلات (Loaders) المتاحة للإصدار المختار
        const loaders = [...new Set(this.state.versions
            .filter(v => v.game_versions.includes(gv))
            .flatMap(v => v.loaders))];

        document.getElementById('loader-section').style.display = 'block';
        document.getElementById('loader-grid').innerHTML = loaders.map(l => `
            <div class="opt-btn" onclick="core.selectLoader(this, '${l}')">${l.toUpperCase()}</div>
        `).join('');
        document.getElementById('action-section').style.display = 'none';
    }

    selectLoader(btn, loader) {
        document.querySelectorAll('#loader-grid .opt-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // البحث عن رابط التحميل المباشر بناءً على الإصدار والمشغل
        const final = this.state.versions.find(v => 
            v.game_versions.includes(this.state.selection.gv) && 
            v.loaders.includes(loader)
        );

        if(final && final.files[0]) {
            document.getElementById('action-section').style.display = 'block';
            document.getElementById('btn-final-dl').onclick = () => window.open(final.files[0].url);
        }
    }

    resetGrid() { 
        this.state.page = 0; 
        document.getElementById('main-grid').innerHTML = ''; 
        document.getElementById('scroll-anchor').style.display = 'block';
        this.fetchData(); 
    }

    resetModal() {
        document.getElementById('gv-grid').innerHTML = '<div style="color:var(--accent); font-size:0.7rem;">جاري جلب الإصدارات الرسمية...</div>';
        document.getElementById('loader-section').style.display = 'none';
        document.getElementById('action-section').style.display = 'none';
    }

    closeModal() { 
        document.getElementById('modal-overlay').style.display = 'none'; 
        document.body.style.overflow = 'auto';
    }
}

// تشغيل المحرك
const core = new LusmistEngine();
