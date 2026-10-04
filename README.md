# KIOSK

Отделен фронтенд за клиентски киоск. Няма собствен сървър и няма собствена база.

Менюто и поръчките минават през API-то на Restaurant POS (`POS-restaurant/Restaurant-POS`):

- категории: `GET /api/categories/get-categories`
- артикули: `GET /api/items/get-item`
- поръчка към кухнята: `POST /api/kitchen/send-order`

Ако артикулът е в менюто, киоскът го показва като наличен. Складът, боновете и кухненският екран остават в Restaurant POS.

## Стартиране

Адресът на Restaurant POS е в `public/config.json`, полето `apiUrl`. Смени го и презареди страницата. Сега сочи към `http://192.168.80.120:8081`.

```bash
npm install
npm run dev
```

Цветовете на целия екран са в `src/theme.css`.
