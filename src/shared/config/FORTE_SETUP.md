# Настройка Forte Bank Payment

## Проблема с публичным ключом

Если вы получаете ошибку "Error" в платежном виджете, скорее всего проблема в **неверном публичном ключе**.

## Как получить правильный ключ:

### 1. Для тестирования
Используйте **тестовый ключ из документации** Forte Bank (уже настроен в коде):
```
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvIeU9CjZ/6cedPKYw3DnUljSdA3Qx75ysisIDTzMxaPNFBN9WuRhPq6TBAoibwclVZuQ5CLWSj4SOY3ifUtzF22DCUUt+XoceVS0dl9HG7HfVOxv+tD/zzP86N+yyjNiJl7sY48TcNzjSoqdQGIL+YAqGJpi3x+5UuXQI1x3XbGTpzhe20BPHMMx4Jpr8T04v0R+KabNTDrPUVBvCEFafXEW5hVoDVb27QfdKyrR2kwfMmaIVl/IcS6GXArWX9EMwmTqMUtNQBeI+VJSokmsZbVAhz5Zypr59vs2GjoPQYa3owJNBKFqV3tGLG5DFNv/Qeb8Kr+f7qWMiAnvGp4jhQIDAQAB
```

### 2. Для продакшена
1. Зайдите в [личный кабинет Forte Bank](https://merchant.fortebank.com/)
2. Перейдите в раздел **"Настройки"** → **"API ключи"**
3. Скопируйте **публичный ключ** (НЕ секретный!)
4. Замените в файле `src/shared/config/forte.ts`:

```typescript
const FORTE_KEYS = {
  PRODUCTION: "ВАШ_РЕАЛЬНЫЙ_КЛЮЧ_ЗДЕСЬ",
}
```

## Частые ошибки:

❌ **Неправильно**: Использование секретного ключа вместо публичного
❌ **Неправильно**: Ключ с неверным форматом (поврежденный при копировании)
❌ **Неправильно**: Ключ не активирован в личном кабинете
❌ **Неправильно**: Использование продакшн ключа в тестовом режиме

✅ **Правильно**: Тестовый ключ для разработки
✅ **Правильно**: Продакшн ключ только для продакшена
✅ **Правильно**: Ключ скопирован полностью без изменений

## Проверка работы:

1. Откройте консоль браузера (F12)
2. Попробуйте сделать платеж
3. Проверьте логи:
   - Должны появиться "Forte Payment Parameters"
   - Не должно быть ошибок "BeGateway is not available"

## Тестовые карты:

- **Успешная оплата**: `4200000000000000`
- **Отклоненная оплата**: `4000000000000002`
- **CVV**: любой трёхзначный код
- **Срок**: любая будущая дата

## Поддержка:

- Документация: https://docs.fortebank.com/
- Техподдержка: support@fortebank.com
