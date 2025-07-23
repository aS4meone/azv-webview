"use client";

export const PaymentContent = () => {
  // Замените на ваш локальный адрес, если порт другой — тоже укажите
  const localUrl = "http://https://g21z9.azvmotors.kz/docs/online_pay.docx";

  return (
    <div className="w-full h-[80vh] flex justify-center items-center">
      <iframe
        src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
          localUrl
        )}`}
        width="100%"
        height="100%"
        frameBorder="0"
        title="Документ"
        style={{ minHeight: 500, background: "#fff" }}
      ></iframe>
    </div>
  );
};
