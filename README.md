# KIOSK

Отделен фронтенд за клиентски киоск. Няма собствен сървър и няма собствена база.

Менюто и поръчките минават през API-то на Restaurant POS (`POS-restaurant/Restaurant-POS`):

- категории: `GET /api/categories/get-categories`
- артикули: `GET /api/items/get-item`
- поръчка към кухнята: `POST /api/kitchen/send-order`

Ако артикулът е в менюто, киоскът го показва като наличен. Складът, боновете и кухненският екран остават в Restaurant POS.

## Стартиране за разработка

Адресът на Restaurant POS е в `public/config.json`, полето `apiUrl`. Смени го и презареди страницата. Сега сочи към `http://192.168.80.120:8081`.

```bash
npm install
npm run dev
```

Цветовете на целия екран са в `src/theme.css`.

## Инсталация с Docker

Образът е Linux контейнер. На Linux сървър върви директно. На Windows върви със Docker Desktop (Linux containers). GitHub Actions го публикува в Docker Hub при push към `main` чрез `DOCKERHUB_USERNAME` и `DOCKERHUB_TOKEN`.

Скриптовете са в `deploy`. И двата свалят образа, записват адреса на POS и пускат киоска на порт `8080`.

Linux:

```bash
chmod +x install.sh
API_URL="http://192.168.80.120:8081" ./install.sh
```

По подразбиране папката е `./kiosk`. За сървъра:

```bash
API_URL="http://192.168.80.120:8081" ./install.sh /opt/kiosk
```

Windows (PowerShell):

```powershell
.\install.ps1 -ApiUrl "http://192.168.80.120:8081"
```

Киоскът се отваря на `http://localhost:8080`. От таблет в същата мрежа: `http://IP-НА-МАШИНАТА:8080`.

Ако потребителят в Docker Hub не е `antonalmishev`, подай друг образ: `DOCKER_IMAGE=user/kiosk:latest` на Linux или `-DockerImage "user/kiosk:latest"` на Windows.
