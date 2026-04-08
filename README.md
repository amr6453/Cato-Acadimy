---
title: CatoLern
emoji: 🎓
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
---

# Cato-Acadimy

أهلاً بيك في مشروع Cato Academy! ده دليل سريع عشان تعرف تشغل الموقع عندك على الجهاز خطوة بخطوة.

## المتطلبات (حاجات لازم تكون متطبة عندك)
- **Python** (عشان الباك إند Django)
- **Node.js** و **npm** (عشان الفرونت إند React / Vite)
- **PostgreSQL** (عشان قاعدة البيانات)

---

## 🛠️ إزاي تشغل الباك إند (Backend - Django)

1. **افتح التيرمينال (Terminal)** وادخل على فولدر المشروع الرئيسي.
2. **اعمل بيئة وهمية (Virtual Environment)** عشان نعزل المكتبات المتعلقة بالمشروع (اختياري بس يُفضل جداً):
   ```bash
   python -m venv venv
   ```
3. **شغل البيئة الوهمية**:
   - لو أنت ويندوز:
     ```bash
     venv\Scripts\activate
     ```
   - لو ماك أو لينكس:
     ```bash
     source venv/bin/activate
     ```
4. **نزل المكتبات المطلوبة**:
   ```bash
   pip install -r requirements.txt
   ```
5. **إعدادات البيئة (`.env`)**:
   - لو في ملف اسمه `.env.example`، خده كوبي واعمل ملف جديد اسمه `.env` وحط فيه بيانات الداتابيز بتاعتك ومفتاح الـ SECRET_KEY.
6. **تجهيز قاعدة البيانات (Migrations)**:
   - عشان نكريت الجداول في الداتابيز، اكتب:
   ```bash
   python manage.py migrate
   ```
7. **شغل السيرفر**:
   ```bash
   python manage.py runserver
   ```
   *كده الباك إند بتاعك شغال على الرابط: `http://127.0.0.1:8000`*

---

## 🎨 إزاي تشغل الفرونت إند (Frontend - React/Vite)

1. **افتح تيرمينال جديد** وادخل على فولدر `frontend`.
   ```bash
   cd frontend
   ```
2. **نزل كل الـ Packages المطلوبة**:
   ```bash
   npm install
   ```
3. **شغل الموقع**:
   ```bash
   npm run dev
   ```
   *الموقع هيفتح معاك غالباً على الرابط ده: `http://localhost:5173`*

---

## 💡 ملاحظات سريعة:
- **مهم جداً**: لازم تكون مشغل السيرفرين (الباك إند والفرونت إند) مع بعض في نفس الوقت عشان الموقع يعرف يقرأ الداتا ويشتغل بشكل كامل.
- عشان الفيديوهات والصور تشتغل معاك تمام، اتأكد إن فولدر الـ `media` موجود وشغال من الباك إند.
- لو حابب تعمل حساب "أدمن" (Superuser) عشان تخش على لوحة تحكم الباك إند:
  ```bash
  python manage.py createsuperuser
  ```

بالتوفيق! 🚀
