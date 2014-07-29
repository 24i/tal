require.def ('antie/widgets/state_view_container', [
    'antie/widgets/container',
    'antie/events/keyevent',
    'antie/widgets/button'
], function(Container, KeyEvent, Button){
    var keyMapping = { }
    keyMapping[KeyEvent.VK_UP] = 'up';
    keyMapping[KeyEvent.VK_DOWN] = 'down';
    keyMapping[KeyEvent.VK_LEFT] = 'left';
    keyMapping[KeyEvent.VK_RIGHT] = 'right';
    keyMapping[KeyEvent.VK_BACK] = 'back';

     var StateViewContainer = Container.extend( {

        init:function(controller) {
            this._super();

            var self = this;


            this.focusButtonHack = new Button();
            this.appendChildWidget(this.focusButtonHack);

            this.addEventListener("select",  function() { controller.select(); });

            this.addEventListener("keydown", function(evt){
               var mappedFunctionName = keyMapping[evt.keyCode];
                if (mappedFunctionName){
                   controller[mappedFunctionName]();
               }
            });

            this.addEventListener("afterhide", function(evt) {
                  self.focusHack();
            });

            this.addEventListener("beforeshow", function(evt) {
                   self.getCurrentApplication().setActiveComponent(evt.component.id);
            });

        },
        focusHack: function() {
           this._isFocussed = true;
           this.focusButtonHack.focus();
        }
    } )

    return StateViewContainer;

});