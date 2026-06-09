# Инструкция по сдаче проекта

Этот файл нужен только локально. Он добавлен в `.gitignore`, поэтому не должен попасть на GitHub.

## Данные проекта

Студент: Делба Милана.

Группа: ТРПО23-2.

Вариант: 3.

Группа API: `apf-cohort-203`.

Что уже сделано:

- создана отдельная папка проекта `mesto-ad_Милана`;
- реализована логика варианта 3: статистика карточек открывается по клику на логотип;
- личный токен и идентификатор группы уже внесены в `src/scripts/components/api.js`;
- подготовлен публичный `README.md`;
- подготовлен workflow GitHub Actions для деплоя в отдельный публичный репозиторий;
- этот приватный файл добавлен в `.gitignore`.

Что ещё нужно сделать:

- проверить проект локально;
- создать приватный репозиторий с исходниками;
- создать публичный репозиторий для GitHub Pages;
- настроить GitHub token и secrets;
- включить Pages из ветки `main` и папки `/root`;
- заменить ссылку в `README.md` на реальную ссылку опубликованного сайта;
- добавить преподавателя в collaborators приватного репозитория;
- отправить работу на платформе.

## 1. Открыть папку проекта

Открыть терминал или PowerShell прямо в папке проекта `mesto-ad_Милана`.

Если проект лежит в другой директории, это нормально. Главное, чтобы команды выполнялись из корня проекта, где находятся `package.json`, `index.html` и папка `src`.

## 2. Проверить данные API

Открыть файл:

```text
src/scripts/components/api.js
```

Там уже должны быть данные Миланы:

```js
baseUrl: "https://mesto.nomoreparties.co/v1/apf-cohort-203",
authorization: "20bc390a-ad05-4ae5-b3f2-c2c632f840ce",
```

Если значения отличаются, значит открыта не та копия проекта.

## 3. Проверить локально

Установить зависимости:

```powershell
npm install
```

Если PowerShell ругается на `npm.ps1`, использовать:

```powershell
npm.cmd install
```

Запустить проект:

```powershell
npm run dev
```

или:

```powershell
npm.cmd run dev
```

Открыть ссылку из терминала, обычно:

```text
http://localhost:5173/
```

Проверить сборку:

```powershell
npm run build
```

или:

```powershell
npm.cmd run build
```

Если сборка прошла успешно, появится папка `dist`. Её не нужно добавлять в Git.

## 4. Создать приватный репозиторий

На GitHub создать новый репозиторий:

```text
mesto-ad-milana
```

Настройки:

- `Private`;
- не добавлять README;
- не добавлять `.gitignore`;
- не добавлять license.

Репозиторий должен быть пустым.

## 5. Залить исходники

В папке проекта выполнить:

```powershell
git init
git branch -M main
git remote add origin https://github.com/<github-login>/mesto-ad-milana
git add .
git commit -m "Mesto project"
git push -u origin main
```

`<github-login>` заменить на GitHub-логин Миланы.

Если появилась ошибка `rejected main -> main (fetch first)`, значит удалённый репозиторий не пустой. Самый простой вариант — удалить его на GitHub и создать заново пустым, без README.

## 6. Создать публичный репозиторий для сайта

Создать второй репозиторий:

```text
mesto-ad-milana-pages
```

Настройки:

- `Public`;
- не добавлять README;
- не добавлять `.gitignore`;
- не добавлять license.

В него GitHub Actions будет отправлять готовую сборку сайта.

## 7. Создать GitHub token для деплоя

Открыть:

```text
GitHub -> Settings -> Developer settings -> Personal access tokens -> Fine-grained tokens -> Generate new token
```

Выставить:

- `Token name`: `mesto-ad-milana-pages`;
- `Repository access`: `Only select repositories`;
- выбрать публичный репозиторий `mesto-ad-milana-pages`;
- `Repository permissions -> Contents -> Read and write`.

Нажать `Generate token` и сразу скопировать токен.

## 8. Добавить secrets

Открыть приватный репозиторий `mesto-ad-milana`:

```text
Settings -> Secrets and variables -> Actions -> New repository secret
```

Добавить:

```text
Name: PUBLIC_PAGES_TOKEN
Secret: <скопированный GitHub token>
```

Добавить:

```text
Name: PUBLIC_PAGES_REPO
Secret: <github-login>/mesto-ad-milana-pages
```

## 9. Проверить GitHub Actions

После `git push` открыть:

```text
Actions -> Deploy to Public Pages Repository
```

Нужна зелёная галочка.

Если ошибка `not found deploy key or tokens`, проверить secret `PUBLIC_PAGES_TOKEN`.

Если ошибка прав доступа, проверить:

- token создан для публичного репозитория `mesto-ad-milana-pages`;
- у token есть `Contents: Read and write`;
- `PUBLIC_PAGES_REPO` записан в формате `<github-login>/<repo-name>`.

## 10. Включить GitHub Pages

В публичном репозитории `mesto-ad-milana-pages` открыть:

```text
Settings -> Pages
```

Выставить:

```text
Source: Deploy from a branch
Branch: main
Folder: /root
```

Нажать `Save`.

## 11. Открыть сайт

Ссылка будет такой:

```text
https://<github-login>.github.io/mesto-ad-milana-pages/
```

Если открывается 404, проверить:

- Pages включён в публичном репозитории;
- выбраны `main` и `/root`;
- workflow `pages build and deployment` завершился успешно;
- после настройки прошло несколько минут;
- в публичном репозитории есть `index.html`, папка `assets` и файл `.nojekyll`.

## 12. Обновить README

В `README.md` заменить пример ссылки на реальную опубликованную ссылку.

Затем выполнить:

```powershell
git add README.md
git commit -m "docs: add pages link"
git push origin main
```

## 13. Финальная проверка

На опубликованном сайте проверить:

- профиль загружается;
- карточки загружаются;
- редактирование профиля работает;
- обновление аватара работает;
- добавление карточки работает;
- удаление своей карточки работает;
- перед удалением есть подтверждение;
- лайки ставятся и снимаются;
- картинка открывается в попапе;
- клик по логотипу открывает статистику карточек;
- в статистике есть количество карточек, первая и последняя карточка, общее количество лайков и самая популярная карточка;
- формы валидируются;
- попапы закрываются по крестику, оверлею и `Esc`;
- в консоли браузера нет красных JavaScript-ошибок.

## 14. Подключить преподавателя

Если исходный репозиторий приватный:

```text
Settings -> Collaborators -> Add people
```

Добавить GitHub username преподавателя и дождаться, пока приглашение будет принято.

## 15. Сдать на платформе

На платформе Практикума нажать `Сдать работу`.

Если платформа просит ссылки, указать:

- ссылку на приватный репозиторий с исходным кодом;
- ссылку на опубликованный сайт GitHub Pages.
