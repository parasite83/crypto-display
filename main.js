(function($) {
  var placeholder = $('.price');
  var webSocket;
  var refreshInterval;
  var price;
  var priceOld = 0;
  var diff = 0;
  var status = 'normal';

  var subscribeMsg = {
    "event": "bts:subscribe",
    "data": {
      "channel": "order_book_ethusd"
    }
  };

  var formatter = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 1
  });

  var updatePrice = function(data) {
    price = data.asks[0][0];

    if (price !== priceOld) {
      diff = price - priceOld;

      if (diff == 0) {
        status = 'normal';
      }
      if (diff > 0) {
        status = 'inc';
      }
      if (diff < 0) {
        status = 'desc';
      }

      priceOld = price;
    }
  };

  var refresh = function() {
    placeholder.html(formatter.format(price));
    placeholder.attr('status', status);
  }

  var initWebsocket = function() {
    ws = new WebSocket("wss://ws.bitstamp.net");

    ws.onopen = function () {
      ws.send(JSON.stringify(subscribeMsg));
    };

    ws.onmessage = function (evt) {
      response = JSON.parse(evt.data);

      switch (response.event) {
        case 'data': {
          updatePrice(response.data);
          break;
        }
        case 'bts:request_reconnect': {
          initWebsocket();
          break;
        }
      }

    };

    ws.onclose = function () {
      initWebsocket();
    };
  };

  $(function() {
    initWebsocket();

    refreshInterval = setInterval(function() {
      refresh();
    }, 1000);
  });

})(jQuery);
