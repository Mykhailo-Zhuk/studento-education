# 🎨 GTM Design System

Дизайн-система для платформи **GTM Agent** — інтерфейс для дослідження контактів, копірайтингу та розсилок.

---

## 🎨 ЗАГАЛЬНІ ДИЗАЙН-ТОКЕНИ

### Кольори

| Токен | Значення |
|-------|----------|
| Primary Purple | `#7C3AED` (RGB 124, 58, 237) |
| Primary Purple Hover | `#6D28D9` |
| Secondary Teal | `#14B8A6` |
| Background Light | `#FFFFFF` |
| Background Dark | `#0F172A` |
| Surface Gray | `#F8FAFC` |
| Surface Gray Dark | `#1E293B` |
| Text Primary | `#1E293B` |
| Text Secondary | `#64748B` |
| Text Muted | `#94A3B8` |
| Border | `#E2E8F0` |
| Border Dark | `#334155` |
| Success | `#10B981` |
| Warning | `#F59E0B` |
| Info | `#3B82F6` |

### Типографіка

| Елемент | Властивості |
|---------|-------------|
| Font Family | Inter, -apple-system, BlinkMacSystemFont, "Segoe UI" |
| H1 | 32px/700, letter-spacing: -0.025em |
| H2 | 24px/600, letter-spacing: -0.02em |
| H3 | 18px/600 |
| Body | 14px/400, line-height: 1.5 |
| Body Small | 13px/400 |
| Caption | 12px/400 |
| Code | 13px, "SF Mono", Monaco, monospace |

### Відступи

4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px

### Border Radius

| Елемент | Значення |
|---------|----------|
| Buttons | 6px |
| Cards | 8px |
| Modals | 12px |
| Badges | 9999px |

---

## 📄 СТОРІНКА 1: GTM Agent — Research Contacts

![Research Contacts Page](./page-01-research-contacts.jpg)

### Структура макета

**Загальний контейнер:**
- Background: `#F8FAFC`
- Padding: 0
- Height: 100vh

**Ліва панель (Sidebar):**
- Width: 260px
- Background: `#0F172A` (dark navy)
- Padding: 20px 16px
- Border-right: 1px solid `#1E293B`

**Заголовок Sidebar:**
- Text: "GTM Agent"
- Font: 18px/600, Inter
- Color: `#FFFFFF`
- Margin-bottom: 24px
- Padding: 0 12px
- Можливий логотип ліворуч (іконка)

### Навігаційне меню

Кожен пункт меню:
- Container: flex, align-items: center, gap: 12px
- Height: 40px
- Padding: 0 12px
- Border-radius: 8px
- Background: transparent (default) або rgba(124, 58, 237, 0.15) (active)
- Color: `#94A3B8` (default) або `#FFFFFF` (active)
- Font: 14px/500
- Cursor: pointer
- Transition: all 0.2s ease

**Стани:**
- Default: color `#94A3B8`, background transparent
- Hover: color `#FFFFFF`, background rgba(255, 255, 255, 0.05)
- Active: color `#FFFFFF`, background rgba(124, 58, 237, 0.15), border-left 3px solid `#7C3AED`

**Іконки:**
- Size: 20x20px
- Stroke-width: 1.5
- Color: inherit

**Пункти меню:**
1. 🔍 Research (активний)
2. ✏️ Copywrite
3. 📧 Send Email

### Права область (Main Content)

- Flex: 1
- Padding: 32px 40px
- Background: `#F8FAFC`

**Заголовок сторінки:**
- Text: "Research Contacts"
- Font: 32px/700, Inter
- Color: `#1E293B`
- Letter-spacing: -0.025em
- Margin-bottom: 24px

### Контейнер таблиці

- Background: `#FFFFFF`
- Border-radius: 12px
- Box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)
- Overflow: hidden
- Border: 1px solid `#E2E8F0`

### Таблиця

**Header Row:**
- Background: `#F8FAFC`
- Border-bottom: 1px solid `#E2E8F0`
- Height: 48px

**Клітинки заголовка:**
- Padding: 0 16px
- Font: 12px/600, Inter
- Color: `#64748B`
- Text-transform: uppercase
- Letter-spacing: 0.05em

**Колонки (ширина):**
1. Checkbox (40px)
2. Name (180px)
3. Title (160px)
4. Company (140px)
5. Location (120px)
6. Contact (140px)
7. Linkedin (80px)
8. Employ (80px)
9. Industry (120px)

**Data Rows:**
- Height: 64px
- Border-bottom: 1px solid `#E2E8F0`
- Hover: background `#F8FAFC`
- Cursor: pointer

**Data Cells:**
- Padding: 16px
- Font: 14px/400, Inter
- Color: `#1E293B`
- Vertical-align: middle

**Checkbox:**
- Size: 18x18px
- Border: 2px solid `#CBD5E1`
- Border-radius: 4px
- Checked: background `#7C3AED`, border `#7C3AED`, white checkmark
- Transition: all 0.15s ease

**Avatar (колонка Name):**
- Size: 32x32px
- Border-radius: 50%
- Background: gradient (purple to teal)
- Color: white
- Font: 13px/600
- Margin-right: 12px
- Display: inline-flex, align-items: center, justify-content: center

**Приклад даних у таблиці:**

| Name | Title | Company | Location | Contact | Linkedin | Employ | Industry |
|------|-------|---------|----------|---------|----------|--------|----------|
| John Smith | CEO | TechCorp | San Francisco | john@tech.com | [icon] | 50-100 | SaaS |
| Sarah Johnson | CTO | DataFlow | New York | sarah@data.io | [icon] | 100-250 | Analytics |

### Нижня панель сповіщень

- Position: fixed, bottom: 0, left: 260px, right: 0
- Height: 56px
- Background: linear-gradient(90deg, `#7C3AED` 0%, `#6D28D9` 100%)
- Padding: 0 40px
- Display: flex, align-items: center, justify-content: space-between
- Box-shadow: 0 -4px 12px rgba(124, 58, 237, 0.2)

**Text:**
- "Enriching the missing info..."
- Font: 14px/500
- Color: `#FFFFFF`
- Animation: pulse dot indicator

**Progress indicator:**
- Spinner або progress bar
- Color: white з прозорістю
- Size: 20x20px

---

## 📄 СТОРІНКА 2: Cofounder Diagram

![Cofounder Diagram](./page-02-cofounder-diagram.jpg)

### Структура макета

**Загальний контейнер:**
- Background: `#0F172A` (темний)
- Height: 100vh
- Display: flex, justify-content: center, align-items: center

**Заголовок сторінки:**
- Position: top-center
- Text: "Team Structure"
- Font: 24px/600, Inter
- Color: `#FFFFFF`
- Margin: 32px 0

**Діаграма (Radial Layout):**

**Центральний елемент "Cofounder":**
- Position: center
- Size: 120x120px
- Background: linear-gradient(135deg, `#7C3AED` 0%, `#9333EA` 100%)
- Border-radius: 50%
- Border: 3px solid rgba(255, 255, 255, 0.1)
- Box-shadow: 0 0 40px rgba(124, 58, 237, 0.4)
- Display: flex, align-items: center, justify-content: center
- Font: 16px/600, Inter
- Color: `#FFFFFF`
- Text-align: center

**Зовнішні вузли (8 штук):**
- Size: 100x100px
- Background: `#1E293B`
- Border-radius: 16px
- Border: 1px solid `#334155`
- Display: flex, flex-direction: column, align-items: center, justify-content: center
- Gap: 8px
- Padding: 16px
- Position: радіально від центру (radius: 280px)

**Badge на кожному вузлі:**
- Position: absolute, top: -8px, right: -8px
- Min-width: 24px
- Height: 24px
- Background: `#7C3AED`
- Border-radius: 12px
- Font: 12px/600, Inter
- Color: `#FFFFFF`
- Padding: 0 8px
- Display: flex, align-items: center, justify-content: center

**З'єднувальні лінії:**
- Color: `#334155`
- Stroke-width: 2px
- Stroke-dasharray: 4 4 (пунктирна)
- Animation: dash-offset animation

**Вузли діаграми:**
1. Marketing (іконка мегафону, badge: 3)
2. Operations (іконка шестерні, badge: 5)
3. Design (іконка палітри, badge: 2)
4. Engineering (іконка коду, badge: 8)
5. Finance (іконка діаграми, badge: 4)
6. Sales (іконка графіку, badge: 6)
7. Support (іконка навушників, badge: 3)
8. My Agents (іконка робота, badge: 12)

### Preview Cards (права сторона)

- Position: right side
- Width: 320px
- Display: flex, flex-direction: column
- Gap: 16px

**Card:**
- Background: `#1E293B`
- Border-radius: 12px
- Border: 1px solid `#334155`
- Padding: 16px
- Display: flex, gap: 12px
- Cursor: pointer

**Preview Image:**
- Width: 80px
- Height: 60px
- Border-radius: 8px
- Object-fit: cover
- Background: gradient placeholder

**Preview Content:**
- Flex: 1
- Font: 14px/500, Inter
- Color: `#FFFFFF`
- Margin-bottom: 4px
- Description: 12px, color `#94A3B8`

---

## 📄 СТОРІНКА 3: Workflow Interface

![Workflow Interface](./page-03-workflow-interface.jpg)

### Структура макета

**Загальний контейнер:**
- Background: `#F8FAFC`
- Height: 100vh
- Display: flex

**Верхній заголовок:**
- Height: 72px
- Background: `#FFFFFF`
- Border-bottom: 1px solid `#E2E8F0`
- Padding: 0 40px
- Display: flex, align-items: center, justify-content: space-between

**Title:**
- "How to Build a Company"
- Font: 24px/600, Inter
- Color: `#1E293B`

**Breadcrumb:**
- Font: 14px/400
- Color: `#64748B`
- Separator: "/" з padding 8px

**Workflow Canvas:**
- Flex: 1
- Padding: 40px
- Overflow-x: auto
- Overflow-y: hidden

**Stage Container:**
- Display: flex
- Gap: 60px
- Min-width: max-content
- Align-items: flex-start

**Stage Column:**
- Width: 260px
- Display: flex, flex-direction: column
- Gap: 20px

**Stage Header:**
- Background: `#F8FAFC`
- Border: 1px dashed `#CBD5E1`
- Border-radius: 12px
- Padding: 16px 20px
- Text-align: center

**Stage Number Badge:**
- Display: inline-block
- Width: 28px
- Height: 28px
- Background: `#7C3AED`
- Border-radius: 50%
- Font: 13px/600, Inter
- Color: `#FFFFFF`
- Margin-bottom: 8px
- Line-height: 28px

**Stage Title:**
- Font: 14px/600, Inter
- Color: `#1E293B`
- Text-transform: uppercase
- Letter-spacing: 0.05em

**Назви стадій:**
1. BUILD STAGE (badge: 1)
2. STH STAGE (badge: 2)
3. LARES STAGE (badge: 3)

### Task Cards

**Task Card:**
- Background: `#FFFFFF`
- Border-radius: 12px
- Border: 1px solid `#E2E8F0`
- Padding: 20px
- Box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08)
- Transition: all 0.2s ease
- Cursor: pointer

**Hover State:**
- Box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12)
- Border-color: `#7C3AED`
- Transform: translateY(-2px)

**Task Icon:**
- Size: 40x40px
- Background: linear-gradient(135deg, `#7C3AED` 0%, `#9333EA` 100%)
- Border-radius: 10px
- Display: flex, align-items: center, justify-content: center
- Margin-bottom: 12px
- Color: `#FFFFFF`, icon size: 20x20px

**Task Title:**
- Font: 16px/600, Inter
- Color: `#1E293B`
- Margin-bottom: 8px
- Line-height: 1.4

**Task Description:**
- Font: 13px/400, Inter
- Color: `#64748B`
- Line-height: 1.5
- Margin-bottom: 12px

**Task Meta:**
- Display: flex, align-items: center, gap: 12px
- Font: 12px/400, Inter
- Color: `#94A3B8`

**Status Badge:**
- Padding: 4px 10px
- Border-radius: 9999px
- Font: 11px/600, Inter
- Text-transform: uppercase
- Letter-spacing: 0.025em

**Status Variants:**
- Completed: background `#D1FAE5`, color `#059669`
- In Progress: background `#FEF3C7`, color `#D97706`
- Pending: background `#F1F5F9`, color `#64748B`

### З'єднувальні лінії між картками

- Position: absolute
- Stroke: 2px solid `#CBD5E1`
- Fill: none
- Stroke-linecap: round

**Arrow head:**
- Size: 8x8px
- Fill: `#CBD5E1`
- Position: в кінці лінії

### Congratulatory Modal/Panel

- Position: fixed, right: 40px, top: 50%, transform: translateY(-50%)
- Width: 340px
- Background: `#FFFFFF`
- Border-radius: 16px
- Border: 1px solid `#E2E8F0`
- Box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15)
- Padding: 32px
- Text-align: center

**Illustration:**
- Width: 280px
- Height: 180px
- Border-radius: 12px
- Object-fit: cover
- Margin-bottom: 24px
- Background: placeholder з зображенням торта, соняшників, автомобіля

**Congratulation Text:**
- "Great job, Andrew!"
- Font: 24px/700, Inter
- Color: `#1E293B`
- Margin-bottom: 12px
- Letter-spacing: -0.02em

**Subtext:**
- Font: 14px/400, Inter
- Color: `#64748B`
- Line-height: 1.6
- Margin-bottom: 24px

**Button:**
- Width: 100%
- Height: 48px
- Background: `#7C3AED`
- Border-radius: 8px
- Font: 14px/600, Inter
- Color: `#FFFFFF`
- Border: none
- Cursor: pointer
- Transition: background 0.2s ease

---

## 📄 СТОРІНКА 4: Dashboard — Tasks Review

![Dashboard Tasks Review](./page-04-dashboard-tasks.jpg)

### Структура макета

**Загальний контейнер:**
- Background: `#F8FAFC`
- Height: 100vh
- Display: flex

**Sidebar (ліворуч):**
- Width: 240px
- Background: `#FFFFFF`
- Border-right: 1px solid `#E2E8F0`
- Padding: 24px 16px

**Logo/Brand:**
- Height: 40px
- Display: flex, align-items: center, gap: 12px
- Margin-bottom: 32px

**Logo Icon:**
- Size: 32x32px
- Background: `#7C3AED`
- Border-radius: 8px
- Color: white

**Brand Name:**
- "cofounder.co"
- Font: 16px/600, Inter
- Color: `#1E293B`

**User Profile Section:**
- Display: flex, align-items: center, gap: 12px
- Padding: 12px
- Background: `#F8FAFC`
- Border-radius: 10px
- Margin-bottom: 24px

**Avatar:**
- Size: 40x40px
- Border-radius: 50%
- Background: linear-gradient(135deg, `#7C3AED`, `#14B8A6`)
- Font: 14px/600, Inter
- Color: `#FFFFFF`
- Display: flex, align-items: center, justify-content: center

**User Info:**
- Name: 14px/600, Inter, color `#1E293B`
- Role: 12px/400, Inter, color `#64748B`

### Main Content Area

- Flex: 1
- Padding: 40px
- Overflow-y: auto

**Welcome Header:**
- Margin-bottom: 32px

**Greeting:**
- "Good morning, Andrew"
- Font: 28px/700, Inter
- Color: `#1E293B`
- Letter-spacing: -0.025em
- Margin-bottom: 8px

**Date:**
- "Friday, May 5, 2026"
- Font: 14px/400, Inter
- Color: `#64748B`

**Section Header:**
- Display: flex, align-items: center, justify-content: space-between
- Margin-bottom: 20px

**Title:**
- "Tasks Awaiting Review"
- Font: 18px/600, Inter
- Color: `#1E293B`

**Filter/Sort Controls:**
- Display: flex, gap: 12px

### Tasks Grid

- Display: grid
- Grid-template-columns: repeat(auto-fill, minmax(320px, 1fr))

### Task Card

**Card:**
- Background: `#FFFFFF`
- Border-radius: 12px
- Border: 1px solid `#E2E8F0`
- Padding: 20px
- Box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08)
- Transition: all 0.2s ease

**Hover:**
- Box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12)
- Transform: translateY(-2px)

**Agent Badge:**
- Display: inline-flex, align-items: center, gap: 6px
- Padding: 6px 12px
- Border-radius: 9999px
- Font: 12px/500, Inter
- Margin-bottom: 12px

**Variants by agent type:**
- Design: background `#FCE7F3`, color `#BE185D`, icon: palette
- Sales: background `#DBEAFE`, color `#1E40AF`, icon: chart
- Engineering: background `#D1FAE5`, color `#047857`, icon: code
- Marketing: background `#FEF3C7`, color `#B45309`, icon: megaphone

**Task Title:**
- Font: 16px/600, Inter
- Color: `#1E293B`
- Margin-bottom: 8px
- Line-height: 1.4

**Task Preview:**
- Font: 13px/400, Inter
- Color: `#64748B`
- Line-height: 1.5
- Margin-bottom: 16px
- Max-lines: 2
- Overflow: hidden, text-overflow: ellipsis

**Meta Footer:**
- Display: flex, align-items: center, justify-content: space-between
- Padding-top: 12px
- Border-top: 1px solid `#F1F5F9`

**Timestamp:**
- Font: 12px/400, Inter
- Color: `#94A3B8`
- Example: "2 hours ago"

**Action Buttons:**
- Display: flex, gap: 8px
- Icon buttons (16x16px) з transparent background

### Quick Stats Panel (верхній правий кут)

- Display: flex, gap: 16px
- Margin-bottom: 32px

**Stat Card:**
- Background: `#FFFFFF`
- Border-radius: 10px
- Border: 1px solid `#E2E8F0`
- Padding: 16px 20px
- Min-width: 140px

**Stat Number:**
- Font: 28px/700, Inter
- Color: `#1E293B`
- Margin-bottom: 4px

**Stat Label:**
- Font: 12px/500, Inter
- Color: `#64748B`
- Text-transform: uppercase

---

## 📄 СТОРІНКА 5: Email Draft Interface

![Email Draft Interface](./page-05-email-draft.jpg)

### Структура макета

**Загальний контейнер:**
- Background: `#FFFFFF`
- Height: 100vh
- Display: flex, flex-direction: column

**Top Navigation Bar:**
- Height: 64px
- Background: `#FFFFFF`
- Border-bottom: 1px solid `#E2E8F0`
- Padding: 0 32px
- Display: flex, align-items: center, justify-content: space-between

**Left Section:**
- Back Button (icon + "Back")
- Font: 14px/500, Inter
- Color: `#64748B`
- Cursor: pointer

**Center Section:**
- "New Message"
- Font: 16px/600, Inter
- Color: `#1E293B`

**Right Section:**
- Logo/actions

### Email Editor Container

- Flex: 1
- Max-width: 800px
- Margin: 40px auto
- Width: 100%
- Padding: 0 40px

### Email Metadata Fields

- Display: flex, flex-direction: column
- Gap: 16px
- Margin-bottom: 24px

**Field Row:**
- Display: flex, align-items: center
- Gap: 12px
- Border-bottom: 1px solid `#F1F5F9`

**Field Label:**
- Min-width: 80px
- Font: 14px/500, Inter
- Color: `#64748B`
- Text-transform: capitalize

**Field Input:**
- Flex: 1
- Font: 14px/400, Inter
- Color: `#1E293B`
- Border: none
- Padding: 12px 0
- Background: transparent
- Outline: none

**To Field:**
- Display: flex, align-items: center, gap: 8px
- Recipient Chip:
  - Background: `#F8FAFC`
  - Border: 1px solid `#E2E8F0`
  - Border-radius: 9999px
  - Padding: 6px 12px
  - Font: 13px/500, Inter
  - Color: `#1E293B`
  - Display: inline-flex, align-items: center, gap: 6px
  - Close icon (x)

### Email Subject

- Margin-bottom: 24px

**Subject Input:**
- Font: 20px/600, Inter
- Color: `#1E293B`
- Border: none
- Background: transparent
- Width: 100%
- Outline: none
- Placeholder: "Subject..."

**Subject Line:**
- "Quick question about Cascade FinTech"
- Letter-spacing: -0.01em

### Email Body

- Flex: 1
- Border: 1px solid `#E2E8F0`
- Border-radius: 12px
- Overflow: hidden
- Display: flex, flex-direction: column

**Toolbar (опціонально):**
- Height: 44px
- Background: `#F8FAFC`
- Border-bottom: 1px solid `#E2E8F0`
- Padding: 0 16px
- Display: flex, align-items: center, gap: 4px
- Formatting buttons (Bold, Italic, Link, etc.)

**Content Area:**
- Flex: 1
- Padding: 24px
- Font: 15px/400, Inter
- Color: `#1E293B`
- Line-height: 1.6
- Outline: none
- Background: `#FFFFFF`

**Email Content:**
- Greeting: "Hi Alex,"
- Paragraphs з margin-bottom: 16px
- Text про AI agent workflows
- Closing: "Best, Sarah"

### AI Suggestion Panel (права сторона)

- Position: fixed, right: 40px, top: 120px
- Width: 280px
- Background: `#F8FAFC`
- Border-radius: 12px
- Border: 1px solid `#E2E8F0`
- Padding: 20px

**Header:**
- Display: flex, align-items: center, gap: 8px
- Font: 14px/600, Inter
- Color: `#1E293B`
- Margin-bottom: 12px

**AI Icon:**
- Size: 20x20px
- Background: `#7C3AED`
- Border-radius: 50%
- Color: white

**Suggestion Text:**
- Font: 13px/400, Inter
- Color: `#64748B`
- Line-height: 1.5
- Margin-bottom: 16px

**Apply Button:**
- Width: 100%
- Height: 36px
- Background: transparent
- Border: 1px solid `#7C3AED`
- Border-radius: 8px
- Font: 13px/600, Inter
- Color: `#7C3AED`
- Cursor: pointer

### Bottom Action Bar

- Position: sticky, bottom: 0
- Height: 72px
- Background: `#FFFFFF`
- Border-top: 1px solid `#E2E8F0`
- Padding: 0 40px
- Display: flex, align-items: center, justify-content: space-between

**Left Actions:**
- Display: flex, gap: 16px
- Icon buttons (Attach, Schedule, etc.)

**Send Button:**
- Height: 44px
- Min-width: 120px
- Background: linear-gradient(90deg, `#7C3AED` 0%, `#6D28D9` 100%)
- Border-radius: 8px
- Font: 14px/600, Inter
- Color: `#FFFFFF`
- Border: none
- Cursor: pointer
- Display: flex, align-items: center, gap: 8px
- Padding: 0 24px
- Box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3)

**Send Icon:**
- Size: 16x16px
- Color: white

---

## 🎯 КОМПОНЕНТИ ДИЗАЙН-СИСТЕМИ

![Design System Overview](./page-06-overview.jpg)

### Buttons

**Primary Button:**
- Height: 44px (large), 36px (medium), 32px (small)
- Padding: 0 24px (large), 0 20px (medium), 0 16px (small)
- Background: `#7C3AED`
- Hover: `#6D28D9`
- Font: 14px/600 (large), 13px/600 (medium), 12px/600 (small)
- Color: `#FFFFFF`
- Border-radius: 8px
- Border: none
- Cursor: pointer
- Transition: all 0.2s ease

**Secondary Button:**
- Same dimensions
- Background: transparent
- Border: 1px solid `#7C3AED`
- Color: `#7C3AED`
- Hover: background rgba(124, 58, 237, 0.05)

**Ghost Button:**
- Same dimensions
- Background: transparent
- Border: none
- Color: `#64748B`
- Hover: background `#F1F5F9`, color `#1E293B`

### Input Fields

**Default Input:**
- Height: 44px
- Padding: 0 16px
- Background: `#FFFFFF`
- Border: 1px solid `#E2E8F0`
- Border-radius: 8px
- Font: 14px/400, Inter
- Color: `#1E293B`
- Focus: border-color `#7C3AED`, box-shadow 0 0 0 3px rgba(124, 58, 237, 0.1)

**Placeholder:**
- Color: `#94A3B8`
- Font: 14px/400

**Label:**
- Font: 13px/500, Inter
- Color: `#64748B`
- Margin-bottom: 6px

### Cards

**Standard Card:**
- Background: `#FFFFFF`
- Border-radius: 12px
- Border: 1px solid `#E2E8F0`
- Padding: 20px
- Box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08)
- Hover: box-shadow 0 4px 12px rgba(0, 0, 0, 0.12)

**Dark Card:**
- Background: `#1E293B`
- Border: 1px solid `#334155`
- Border-radius: 12px
- Padding: 20px
- Color: `#FFFFFF`

### Badges

**Default Badge:**
- Height: 24px
- Min-width: 24px
- Padding: 0 10px
- Border-radius: 9999px
- Font: 12px/600, Inter
- Display: inline-flex, align-items: center, justify-content: center

**Color Variants:**
- Purple: background `#7C3AED`, color `#FFFFFF`
- Teal: background `#14B8A6`, color `#FFFFFF`
- Gray: background `#F1F5F9`, color `#64748B`
- Success: background `#D1FAE5`, color `#059669`
- Warning: background `#FEF3C7`, color `#D97706`
- Error: background `#FEE2E2`, color `#DC2626`

### Icons

**Icon Sizes:**
- Small: 16x16px
- Default: 20x20px
- Large: 24x24px
- XLarge: 32x32px

**Stroke Width:** 1.5px
**Icon Library:** Heroicons, Lucide, або Phosphor Icons

---

## 🖼 UI ELEMENTS — Візуальні довідники

### 1. UI Elements Part 1: Navigation & Controls

![Navigation & Controls](./ui-elements-part-1-nav-controls.jpg)

Містить: темний sidebar, навігаційне меню, кнопки (Primary, Secondary, Ghost), іконки, поля вводу, checkbox-и, пошукові поля, dropdown-и

---

### 2. UI Elements Part 2: Cards & Badges

![Cards & Badges](./ui-elements-part-2-cards-badges.jpg)

Містить: agent badges (Design, Sales, Engineering, Marketing), status badges, task cards, contact cards, preview cards, workflow stage cards, таблиці (header, data rows, hover states)

---

### 3. UI Elements Part 3: Diagrams & Icons

![Diagrams & Icons](./ui-elements-part-3-diagrams-icons.jpg)

Містить: повний набір іконок (навігація, дії, статус, бізнес-ікони), аватари різних розмірів, діаграмні вузли (Cofounder + 8 агентів), з'єднувальні лінії, індикатори прогресу

---

### 4. UI Elements Part 4: Modals & Notifications

![Modals & Notifications](./ui-elements-part-4-modals-notifications.jpg)

Містить: вітальний модаль, AI Suggestion panel, email composition panel, notification bar, toast notifications, workflow stages, welcome header, quick stats, user profile section

---

### 5. Cofounder Brand Guidelines

![Brand Guidelines](./cofounder-brand-guidelines.jpg)

Бренд-гайдлайни платформи Cofounder.

---

### 5. UI Elements Part 5: Typography & Spacing

Містить: типографічну шкалу (H1-H3, Body, Small, Caption, Code), кольорову палітру (усі HEX-коди), spacing scale (4px-64px), border radius examples, shadow styles