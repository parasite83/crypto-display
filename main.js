(function($) {
  var placeholder;
  var webSocket;
  var refreshInterval;
  var price;
  var priceOld = 0;
  var diff = 0;
  var status = 'normal';

  var subscribeMsg = {
    "event": "bts:subscribe",
    "data": {
      "channel": "order_book_xrpusd"
    }
  };

  var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split('=');

      if (sParameterName[0] === sParam) {
        return typeof sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
      }
    }

    return false;
  };

  var formatter = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 4
  });

  var updatePrice = function(data) {
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

  var refresh = function() {
    placeholder.html(formatter.format(price));
    placeholder.attr('status', status);
  }

  var initWebsocket = function() {
    ws = new WebSocket('wss://ws.bitstamp.net');

    ws.onopen = function () {
    	var channel = getUrlParameter('channel');
      if (channel) {
        subscribeMsg.data.channel = channel;
      }

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
    placeholder = $('.price');
    initWebsocket();

    refreshInterval = setInterval(function() {
      refresh();
    }, 1000);
  });

})(jQuery);
