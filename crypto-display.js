(function ($) {

  $.cryptoDisplay = function (element, options) {
    var webSocket,
      webSocketMsg,
      price,
      priceOld,
      formatter,
      diff,
      status;
    
    priceOld = 0;
    diff = 0;
    status = 'normal';

    var defaults = {
      channel: 'btcusd',
      digits: 5,
      delay: 1000
    }

    var plugin = this;

    plugin.settings = {}

    var $element = $(element),
      element = element;

    var updatePrice = function (data) {
      price = Number.parseFloat(data.asks[0][0]).toPrecision(6);
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
  
    var refresh = function () {
      $element.html(formatter.format(price));
      $element.attr('status', status);
    }
  
    var initWebsocket = function () {
      webSocket = new WebSocket('wss://ws.bitstamp.net');
  
      webSocket.onopen = function () {
        webSocket.send(JSON.stringify(webSocketMsg));
      };
  
      webSocket.onmessage = function (evt) {
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
  
      webSocket.onclose = function () {
        initWebsocket();
      };
    };
  
    plugin.init = function () {
      plugin.settings = $.extend({}, defaults, options);

      webSocketMsg = {
        "event": "bts:subscribe",
        "data": {
          "channel": "order_book_" + plugin.settings.channel
        }
      };

      formatter = new Intl.NumberFormat('en-IN', {
        minimumSignificantDigits: plugin.settings.digits,
        maximumSignificantDigits: plugin.settings.digits
      });

      initWebsocket();

      setInterval(function () {
        refresh();
      }, 1000);
    }

    plugin.init();
  }

  $.fn.cryptoDisplay = function (options) {
    return this.each(function () {
      if (undefined == $(this).data('cryptoDisplay')) {
        var plugin = new $.cryptoDisplay(this, options);
        $(this).data('cryptoDisplay', plugin);
      }
    });

  }

})(jQuery);
