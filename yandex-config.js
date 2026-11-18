// Опубликованная учебная форма «ФотоЛист». ID сверены по скриншотам конструктора.
// Для вопросов с выбором одного ответа передается именно ID варианта.
window.FOTOLIST_YANDEX = {
  url: 'https://forms.yandex.ru/u/6afb10f149af47002e22be71/',
  fields: {
    name: 'customer_name',
    phone: 'customer_phone',
    email: 'customer_email',
    pickup: 'pickup_point',
    photos: 'photo_link',
    total: 'order_total',
    format: 'photo_format',
    quantity: 'photo_quantity',
    paper: 'paper_type',
    urgency: 'urgency'
  },
  choices: {
    pickup: {
      'Центральный':'9008994096507254',
      'Северный':'1794841812732',
      'Южный':'1794841828536'
    },
    format: {
      '10x15':'9008994099839006',
      '13x18':'1794845145424',
      '15x21':'1794845169323',
      '20x30':'1794845181402',
      'custom':'1794845194332'
    },
    paper: {'glossy':'9008994100068318','matte':'1794845356985'},
    urgency: {'normal':'9008994100193654','express':'1794845518198'}
  }
};
