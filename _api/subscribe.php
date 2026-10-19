<?php
require_once __DIR__ . '/config.php';
cors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);

$body = json_decode(file_get_contents('php://input'), true);
if (!$body) json_error('Invalid JSON');

$email = trim($body['email'] ?? '');
if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) json_error('Некорректный email');

// Рассылка - реклама (ст. 18 ФЗ-38): без предварительного согласия не принимаем.
$consent = consent_record($body);
if (!$consent['given']) json_error('Требуется согласие на обработку персональных данных');

$html = '<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Новый подписчик - Меганом Эко-дом</title>
</head>
<body style="margin:0;padding:0;background:#F0EDE6;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0EDE6;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#1B3A4B;border-radius:16px 16px 0 0;padding:36px 40px;text-align:center;">
            <p style="margin:0 0 4px;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#C9A96E;font-family:Georgia,serif;">ЭКО ДОМ</p>
            <h1 style="margin:0;font-size:28px;font-weight:bold;color:#ffffff;font-family:Georgia,serif;letter-spacing:2px;">МЕГАНОМ</h1>
          </td>
        </tr>
        <tr><td style="background:#C9A96E;height:3px;"></td></tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:48px 40px;text-align:center;">
            <div style="width:64px;height:64px;background:#C9A96E20;border-radius:50%;margin:0 auto 24px;line-height:64px;font-size:28px;">&#9993;</div>
            <h2 style="margin:0 0 12px;font-size:24px;color:#1B3A4B;font-family:Georgia,serif;font-weight:bold;">Новый подписчик!</h2>
            <p style="margin:0 0 32px;font-size:15px;color:#6B7280;font-family:Arial,sans-serif;line-height:1.6;">Кто-то подписался на новости и специальные предложения Меганом Эко-дома.</p>

            <div style="background:#FAFAF7;border:1px solid #F0EDE6;border-left:4px solid #C9A96E;border-radius:10px;padding:20px 24px;text-align:left;margin-bottom:32px;">
              <p style="margin:0 0 4px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#C9A96E;font-family:Arial,sans-serif;">Email подписчика</p>
              <p style="margin:0;font-size:18px;color:#1B3A4B;font-family:Georgia,serif;font-weight:bold;">' . e($email) . '</p>
            </div>

            <a href="mailto:' . e($email) . '" style="display:inline-block;background:#C9A96E;color:#ffffff;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;padding:14px 32px;border-radius:50px;text-decoration:none;letter-spacing:1px;">Написать подписчику</a>
          </td>
        </tr>

        <tr>
          <td style="background:#ffffff;padding:0 40px 32px;">' . consent_email_block($consent) . '</td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#1B3A4B;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;">
            <p style="margin:0 0 6px;font-size:12px;color:#ffffff;font-family:Georgia,serif;">Меганом Эко-дом · мыс Меганом, Крым</p>
            <p style="margin:0;font-size:11px;color:#ffffff50;font-family:Arial,sans-serif;">Это автоматическое уведомление с сайта meganom-eco.ru</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>';

try {
    $mail = make_mailer(MAIL_TO_INFO, 'Меганом Инфо');
    $mail->Subject = 'Новый подписчик - ' . $email;
    $mail->addReplyTo($email);
    $mail->Body    = $html;
    $mail->AltBody = "Новый подписчик: $email"
        . "\n\nСогласие на обработку персональных данных: дано, {$consent['at']}"
        . ", IP {$consent['ip']}, редакция {$consent['version']}";
    $mail->send();
    json_response(['ok' => true]);
} catch (\Exception $e) {
    json_error('Не удалось обработать подписку. Попробуйте позже.', 500);
}
