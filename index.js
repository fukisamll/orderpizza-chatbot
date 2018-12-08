 $(document).ready(function(){
      var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
      if (!isChrome) {
        $("#browserNote").text("請使用Chrome瀏覽器才能進行語音辨識");
      }
    });
	
	 var accessToken = "f0b39420210c46c9ac49233af3b5ff91",
      baseUrl = "https://api.dialogflow.com/v1/",
      $speechInput,
      $recBtn,
      recognition,
      messageRecording = "請靠近麥克風說話...",
      messageCouldntHear = "抱歉我聽不清楚，可以再說一次嗎?",
      messageInternalError = "喔不！網路伺服器出錯了！",
      messageSorry = "利供蝦?";

    $(document).ready(function() {
      $speechInput = $("#speech");
      $recBtn = $("#rec");

      $speechInput.keypress(function(event) {
        if (event.which == 13) {
          event.preventDefault();
          send();
		  this.value = '';
        }
      });
      $recBtn.on("click", function(event) {
        switchRecognition();
      });
      $(".debug__btn").on("click", function() {
        $(this).next().toggleClass("is-active");
        return false;
      });
    });

    function startRecognition() {
      recognition = new webkitSpeechRecognition();
      recognition.continuous = false;
          recognition.interimResults = false;

      recognition.onstart = function(event) {
        respond(messageRecording);
        updateRec();
      };
      recognition.onresult = function(event) {
        recognition.onend = null;
        
        var text = "";
          for (var i = event.resultIndex; i < event.results.length; ++i) {
            text += event.results[i][0].transcript;
          }
          setInput(text);
        stopRecognition();
      };
      recognition.onend = function() {
        respond(messageCouldntHear);
        stopRecognition();
      };
      recognition.lang = "zh-TW";
      recognition.start();
    }
  
    function stopRecognition() {
      if (recognition) {
        recognition.stop();
        recognition = null;
      }
      updateRec();
    }

    function switchRecognition() {
      if (recognition) {
        stopRecognition();
      } else {
        startRecognition();
      }
    }

    function setInput(text) {
      $speechInput.val(text);
      send();
    }

    //function updateRec() {
      //$recBtn.text(recognition ? "Stop" : "Speak");
    //}

    function send() {
      var text = $speechInput.val();
      $.ajax({
        type: "POST",
        url: baseUrl + "query",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: {
          "Authorization": "Bearer " + accessToken
        },
        data: JSON.stringify({query: text, lang: "zh", sessionId: "yaydevdiner"}),

        success: function(data) {
          prepareResponse(data);
        },
        error: function() {
          respond(messageInternalError);
        }
      });
    }

    function prepareResponse(val) {
      var debugJSON = JSON.stringify(val, undefined, 2),
        spokenResponse = val.result.speech;

      respond(spokenResponse);
      debugRespond(debugJSON);
    }

    function debugRespond(val) {
      $("#response").text(val);
    }

	
    function respond(val) {
      if (val == "") {
        val = messageSorry;
      }

      if (val !== messageRecording) {
        var msg = new SpeechSynthesisUtterance();
        msg.voiceURI = "native";
        msg.text = val;
        msg.lang = "zh-TW";
        window.speechSynthesis.speak(msg);
      }

      $("#spokenResponse").addClass("is-active").find(".spoken-response__text").html(val);
    }