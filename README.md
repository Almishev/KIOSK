# KIOSK

Отделен фронтенд за клиентски киоск. Няма собствен сървър и няма собствена база.

Менюто и поръчките минават през API-то на Restaurant POS (`POS-restaurant/Restaurant-POS`):

- категории: `GET /api/categories/get-categories`
- артикули: `GET /api/items/get-item`
- поръчка към кухнята: `POST /api/kitchen/send-order`

Ако артикулът е в менюто, киоскът го показва като наличен. Складът, боновете и кухненският екран остават в Restaurant POS.
