(function() {
	this.BrowserDeviceTest = AsyncTestCase("BrowserDevice");

	this.BrowserDeviceTest.prototype.setUp = function() {
		this.sandbox = sinon.sandbox.create();
	};

	this.BrowserDeviceTest.prototype.tearDown = function() {
		this.sandbox.restore();
	};

	this.BrowserDeviceTest.prototype.testInterface = function(queue) {
		expectAsserts(2);

		queuedRequire(queue, ["antie/devices/browserdevice","antie/devices/device"], function(BrowserDevice, Device) {

			assertEquals('BrowserDevice should be a function', 'function', typeof BrowserDevice);
			var device = new BrowserDevice(antie.framework.deviceConfiguration);
			assert('BrowserDevice should extend from Device', device instanceof Device);

		});
	};

	this.BrowserDeviceTest.prototype.testArrayIndexOf = function(queue) {
		expectAsserts(5);

		queuedRequire(queue, ["antie/devices/browserdevice"], function(BrowserDevice) {
			var device = new BrowserDevice(antie.framework.deviceConfiguration);
			var arr = [1,2,3];
			assertEquals(0, device.arrayIndexOf(arr, 1));
			assertEquals(2, device.arrayIndexOf(arr, 3));
			assertEquals(1, device.arrayIndexOf(arr, 2));
			assertEquals(-1, device.arrayIndexOf(arr, 4));
			assertEquals(-1, device.arrayIndexOf(arr, null));
		});
	};

	function defineElementCreationTests(funcName, expectedTag) {
		expectedTag = expectedTag.toLowerCase();

		this.BrowserDeviceTest.prototype["test" + funcName] = function(queue) {
			expectAsserts(3);

			queuedRequire(queue, ["antie/devices/browserdevice"], function(BrowserDevice) {
				var device = new BrowserDevice(antie.framework.deviceConfiguration);
				var el = device[funcName]();
				assertInstanceOf(Element, el);
				assertEquals(expectedTag, el.tagName.toLowerCase());
				assertEquals("", el.id);
			});
		};
		this.BrowserDeviceTest.prototype["test" + funcName + "ID"] = function(queue) {
			expectAsserts(1);

			queuedRequire(queue, ["antie/devices/browserdevice"], function(BrowserDevice) {
				var device = new BrowserDevice(antie.framework.deviceConfiguration);
				var el = device[funcName]("testID");
				assertEquals("testID", el.id);
			});
		};
		this.BrowserDeviceTest.prototype["test" + funcName + "Classes"] = function(queue) {
			expectAsserts(3);

			queuedRequire(queue, ["antie/devices/browserdevice"], function(BrowserDevice) {
				var device = new BrowserDevice(antie.framework.deviceConfiguration);
				var el = device[funcName](null,["class1","class2","class3"]);
				assertClassName("class1", el);
				assertClassName("class2", el);
				assertClassName("class3", el);

			});
		};
	};

	defineElementCreationTests("createContainer", "div");
	defineElementCreationTests("createLabel", "span");
	defineElementCreationTests("createButton", "div");
	defineElementCreationTests("createList", "ul");
	defineElementCreationTests("createListItem", "li");
	defineElementCreationTests("createImage", "img");

	this.BrowserDeviceTest.prototype.testCreateLabelText = function(queue) {
		expectAsserts(1);

		queuedRequire(queue, ["antie/devices/browserdevice"], function(BrowserDevice) {
			var device = new BrowserDevice(antie.framework.deviceConfiguration);
			var el = device.createLabel(null, null, "HELLO WORLD");
			assertEquals("HELLO WORLD", el.innerHTML);
		});
	};

	this.BrowserDeviceTest.prototype.testCreateImageSize = function(queue) {
		expectAsserts(6);

		queuedRequire(queue, ["antie/devices/browserdevice"], function(BrowserDevice) {
			var device = new BrowserDevice(antie.framework.deviceConfiguration);
			var el = device.createImage(null, null, null, {width:100});
			assertEquals("100px", el.style.width);
			assertEquals("", el.style.height);

			el = device.createImage(null, null, null, {height:123});
			assertEquals("", el.style.width);
			assertEquals("123px", el.style.height);

			el = device.createImage(null, null, null, {width:456, height:123});
			assertEquals("456px", el.style.width);
			assertEquals("123px", el.style.height);
		});
	};

	this.BrowserDeviceTest.prototype.testCreateImageURL = function(queue) {
		expectAsserts(1);

		queuedRequire(queue, ["antie/devices/browserdevice"], function(BrowserDevice) {
			var device = new BrowserDevice(antie.framework.deviceConfiguration);
			var el = device.createImage(null, null, "about:blank");
			assertEquals("about:blank", el.src);
		});
	};

	this.BrowserDeviceTest.prototype.testCreateImageOnLoad = function(queue) {
		expectAsserts(1);

		queuedRequire(queue, ["antie/devices/browserdevice"], function(BrowserDevice) {
			var device = new BrowserDevice(antie.framework.deviceConfiguration);
			queue.call("Waiting for image to load", function(callbacks) {
				var onLoad = callbacks.add(function() {
					assert(true);
				});
				var onError = callbacks.addErrback(function() {});
				device.createImage(null, null, "http://static.bbc.co.uk/frameworks/barlesque/1.10.0/desktop/2.7/img/blocks.png", null, onLoad, onError);
			});
		});
	};

	this.BrowserDeviceTest.prototype.testCreateImageOnError = function(queue) {
		expectAsserts(1);

		queuedRequire(queue, ["antie/devices/browserdevice"], function(BrowserDevice) {
			var device = new BrowserDevice(antie.framework.deviceConfiguration);
			queue.call("Waiting for image to load", function(callbacks) {
				var onLoad = callbacks.addErrback(function() {});
				var onError = callbacks.add(function() {
					assert(true);
				});
				device.createImage(null, null, "invalid:protocol", null, onLoad, onError);
			});
		});
	};
	this.BrowserDeviceTest.prototype.testLoadStyleSheet = function(queue) {
		expectAsserts(2);

		queuedApplicationInit(queue, "lib/mockapplication", ["antie/devices/browserdevice"], function(application, BrowserDevice) {
			var device = new BrowserDevice(antie.framework.deviceConfiguration);
			queue.call("Waiting for stylesheet to load", function(callbacks) {
				var div = document.createElement('div');
				div.id = "sizingdiv";
				document.body.appendChild(div);

				assertEquals(0, div.offsetHeight);
				var timeout = callbacks.add(function() {
					var d2 = document.getElementById('sizingdiv');
					assertNotEquals(0, d2.offsetHeight);
					document.body.removeChild(d2);
				});

				device.loadStyleSheet("/test/fixtures/dynamicstylesheet.css");
				window.setTimeout(timeout, 2000);
			});
		});
	};
	this.BrowserDeviceTest.prototype.testLoadStyleSheetWithCallback = function(queue) {
		expectAsserts(1);

		queuedApplicationInit(queue, "lib/mockapplication", ["antie/devices/browserdevice"], function(application, BrowserDevice) {
			var device = new BrowserDevice(antie.framework.deviceConfiguration);
			queue.call("Waiting for stylesheet to load", function(callbacks) {
				var callback = callbacks.add(function() {
					assert(true);
				});

				device.loadStyleSheet("/test/fixtures/dynamicstylesheet.css", callback);
			});
		});
	};
	this.BrowserDeviceTest.prototype.testAppendChildElement = function(queue) {
		expectAsserts(7);

		queuedRequire(queue, ["antie/devices/browserdevice"], function(BrowserDevice) {
			var device = new BrowserDevice(antie.framework.deviceConfiguration);
			var to = device.createContainer();
			assertInstanceOf(Element, to);
			var el = device.createContainer();
			assertInstanceOf(Element, el);
			assertEquals(0, to.childNodes.length);
			device.appendChildElement(to, el);
			assertEquals(1, to.childNodes.length);
			assertSame(el, to.childNodes[to.childNodes.length - 1]);
			var el2 = device.createContainer();
			device.appendChildElement(to, el2);
			assertEquals(2, to.childNodes.length);
			assertSame(el2, to.childNodes[to.childNodes.length - 1]);
		});
	};

	this.BrowserDeviceTest.prototype.testAppendChildElementWhenElementAlreadyInDOM = function(queue) {
		expectAsserts(8);

		queuedRequire(queue, ["antie/devices/browserdevice"], function(BrowserDevice) {
			var device = new BrowserDevice(antie.framework.deviceConfiguration);
			var to = device.createContainer();
			assertInstanceOf(Element, to);
			var el = device.createContainer();
			assertInstanceOf(Element, el);
			assertEquals(0, to.childNodes.length);
			device.appendChildElement(to, el);
			assertEquals(1, to.childNodes.length);
			assertSame(el, to.childNodes[to.childNodes.length - 1]);
			var to2 = device.createContainer();
			device.appendChildElement(to2, el);
			assertEquals(0, to.childNodes.length);
			assertEquals(1, to2.childNodes.length);
			assertSame(el, to2.childNodes[to2.childNodes.length - 1]);
		});
	};

	this.BrowserDeviceTest.prototype.testPrependChildElement = function(queue) {
		expectAsserts(7);

		queuedRequire(queue, ["antie/devices/browserdevice"], function(BrowserDevice) {
			var device = new BrowserDevice(antie.framework.deviceConfiguration);
			var to = device.createContainer();
			assertInstanceOf(Element, to);
			var el = device.createContainer();
			assertInstanceOf(Element, el);
			assertEquals(0, to.childNodes.length);
			device.prependChildElement(to, el);
			assertEquals(1, to.childNodes.length);
			assertSame(el, to.childNodes[0]);
			var el2 = device.createContainer();
			device.prependChildElement(to, el2);
			assertEquals(2, to.childNodes.length);
			assertSame(el2, to.childNodes[0]);
		});
	};

	this.BrowserDeviceTest.prototype.testPrependChildElementWhenElementAlreadyInDOM = function(queue) {
		expectAsserts(8);

		queuedRequire(queue, ["antie/devices/browserdevice"], function(BrowserDevice) {
			var device = new BrowserDevice(antie.framework.deviceConfiguration);
			var to = device.createContainer();
			assertInstanceOf(Element, to);
			var el = device.createContainer();
			assertInstanceOf(Element, el);
			assertEquals(0, to.childNodes.length);
			device.prependChildElement(to, el);
			assertEquals(1, to.childNodes.length);
			assertSame(el, to.childNodes[0]);
			var to2 = device.createContainer();
			device.prependChildElement(to2, el);
			assertEquals(0, to.childNodes.length);
			assertEquals(1, to2.childNodes.length);
			assertSame(el, to2.childNodes[0]);
		});
	};

	this.BrowserDeviceTest.prototype.testInsertChildElementBefore = function(queue) {
		expectAsserts(7);

		queuedRequire(queue, ["antie/devices/browserdevice"], function(BrowserDevice) {
			var device = new BrowserDevice(antie.framework.deviceConfiguration);
			var to = device.createContainer();
			assertInstanceOf(Element, to);
			var el = device.createContainer();
			assertInstanceOf(Element, el);

			assertEquals(0, to.childNodes.length);
			device.appendChildElement(to, el);
			assertEquals(1, to.childNodes.length);
			assertSame(el, to.childNodes[0]);

			var el2 = device.createContainer();
			device.insertChildElementBefore(to, el2, el);
			assertEquals(2, to.childNodes.length);
			assertSame(el2, to.childNodes[0]);
		});
	};

	this.BrowserDeviceTest.prototype.testInsertChildElementAtBeginning = function(queue) {
		expectAsserts(7);

		queuedRequire(queue, ["antie/devices/browserdevice"], function(BrowserDevice) {
			var device = new BrowserDevice(antie.framework.deviceConfiguration);
			var to = device.createContainer();
			assertInstanceOf(Element, to);
			var el = device.createContainer();
			assertInstanceOf(Element, el);

			assertEquals(0, to.childNodes.length);
			device.appendChildElement(to, el);
			assertEquals(1, to.childNodes.length);
			assertSame(el, to.childNodes[0]);

			var el2 = device.createContainer();
			device.insertChildElementAt(to, el2, 0);
			assertEquals(2, to.childNodes.length);
			assertSame(el2, to.childNodes[0]);
		});
	};
	this.BrowserDeviceTest.prototype.testInsertChildElementAtEnd = function(queue) {
		expectAsserts(7);

		queuedRequire(queue, ["antie/devices/browserdevice"], function(BrowserDevice) {
			var device = new BrowserDevice(antie.framework.deviceConfiguration);
			var to = device.createContainer();
			assertInstanceOf(Element, to);
			var el = device.createContainer();
			assertInstanceOf(Element, el);

			assertEquals(0, to.childNodes.length);
			device.appendChildElement(to, el);
			assertEquals(1, to.childNodes.length);
			assertSame(el, to.childNodes[0]);

			var el2 = device.createContainer();
			device.insertChildElementAt(to, el2, 1);
			assertEquals(2, to.childNodes.length);
			assertSame(el2, to.childNodes[1]);
		});
	};
	this.BrowserDeviceTest.prototype.testGetElementParent = function(queue) {
		expectAsserts(4);

		queuedRequire(queue, ["antie/devices/browserdevice"], function(BrowserDevice) {
			var device = new BrowserDevice(antie.framework.deviceConfiguration);
			var to = device.createContainer();
			assertInstanceOf(Element, to);
			var el = device.createContainer();
			assertInstanceOf(Element, el);
			assertNull(device.getElementParent(el));
			device.appendChildElement(to, el);
			assertSame(to, device.getElementParent(el));
		});
	};
	this.BrowserDeviceTest.prototype.testRemoveElement = function(queue) {
		expectAsserts(4);

		queuedRequire(queue, ["antie/devices/browserdevice"], function(BrowserDevice) {
			var device = new BrowserDevice(antie.framework.deviceConfiguration);
			var to = device.createContainer();
			assertInstanceOf(Element, to);
			var el = device.createContainer();
			assertInstanceOf(Element, el);
			device.appendChildElement(to, el);
			assertNotNull(device.getElementParent(el));
			device.removeElement(el);
			assertNull(device.getElementParent(el));
		});
	};
	this.BrowserDeviceTest.prototype.testClearElement = function(queue) {
		expectAsserts(2);

		queuedRequire(queue, ["antie/devices/browserdevice"], function(BrowserDevice) {
			var device = new BrowserDevice(antie.framework.deviceConfiguration);
			var to = device.createContainer();
			device.appendChildElement(to, device.createContainer());
			device.appendChildElement(to, device.createContainer());
			device.appendChildElement(to, device.createContainer());
			assertEquals(3, to.childNodes.length);

			device.clearElement(to);

			assertEquals(0, to.childNodes.length);
		});
	};
	this.BrowserDeviceTest.prototype.testSetElementClasses = function(queue) {
		expectAsserts(8);

		queuedRequire(queue, ["antie/devices/browserdevice"], function(BrowserDevice) {
			var device = new BrowserDevice(antie.framework.deviceConfiguration);
			var el = device.createContainer();
			assertEquals("", el.className);
			device.setElementClasses(el, ["class1", "class2", "class3"]);
			assertClassName("class1", el);
			assertClassName("class2", el);
			assertClassName("class3", el);
			device.setElementClasses(el, ["class4", "class2", "class5"]);
			assertNoMatch(/class1/, el.className);
			assertClassName("class4", el);
			assertClassName("class2", el);
			assertClassName("class5", el);

		});
	};
	this.BrowserDeviceTest.prototype.testSetRemoveClassFromElement = function(queue) {
		expectAsserts(6);

		queuedRequire(queue, ["antie/devices/browserdevice"], function(BrowserDevice) {
			var device = new BrowserDevice(antie.framework.deviceConfiguration);
			var el = device.createContainer();
			device.setElementClasses(el, ["class1", "class2", "class3"]);
			assertClassName("class1", el);
			assertClassName("class2", el);
			assertClassName("class3", el);
			device.removeClassFromElement(el, "class2");
			assertNoMatch(/class2/, el.className);
			assertClassName("class1", el);
			assertClassName("class3", el);
		});
	};
	this.BrowserDeviceTest.prototype.testSetRemoveClassFromElementDeepFalse = function(queue) {
		expectAsserts(13);

		queuedRequire(queue, ["antie/devices/browserdevice"], function(BrowserDevice) {
			var device = new BrowserDevice(antie.framework.deviceConfiguration);
			var el = device.createContainer();
			var innerEl = device.createContainer();
			device.appendChildElement(el, innerEl);
			assertSame(el, device.getElementParent(innerEl));

			device.setElementClasses(el, ["class1", "class2", "class3"]);
			assertClassName("class1", el);
			assertClassName("class2", el);
			assertClassName("class3", el);
			device.setElementClasses(innerEl, ["class1", "class2", "class3"]);
			assertClassName("class1", innerEl);
			assertClassName("class2", innerEl);
			assertClassName("class3", innerEl);

			device.removeClassFromElement(el, "class2", false);
			assertNoMatch(/class2/, el.className);
			assertClassName("class1", el);
			assertClassName("class3", el);
			assertClassName("class1", innerEl);
			assertClassName("class2", innerEl);
			assertClassName("class3", innerEl);
		});
	};
	this.BrowserDeviceTest.prototype.testSetRemoveClassFromElementDeepTrue = function(queue) {
		expectAsserts(13);

		queuedRequire(queue, ["antie/devices/browserdevice"], function(BrowserDevice) {
			var device = new BrowserDevice(antie.framework.deviceConfiguration);
			var el = device.createContainer();
			var innerEl = device.createContainer();
			device.appendChildElement(el, innerEl);
			assertSame(el, device.getElementParent(innerEl));

			device.setElementClasses(el, ["class1", "class2", "class3"]);
			assertClassName("class1", el);
			assertClassName("class2", el);
			assertClassName("class3", el);
			device.setElementClasses(innerEl, ["class1", "class2", "class3"]);
			assertClassName("class1", innerEl);
			assertClassName("class2", innerEl);
			assertClassName("class3", innerEl);

			device.removeClassFromElement(el, "class2", true);
			assertNoMatch(/class2/, el.className);
			assertNoMatch(/class2/, innerEl.className);
			assertClassName("class1", el);
			assertClassName("class3", el);
			assertClassName("class1", innerEl);
			assertClassName("class3", innerEl);
		});
	};
	this.BrowserDeviceTest.prototype.testAddClassToElement = function(queue) {
		expectAsserts(2);

		queuedRequire(queue, ["antie/devices/browserdevice"], function(BrowserDevice) {
			var device = new BrowserDevice(antie.framework.deviceConfiguration);
			var el = device.createContainer();
			assertEquals("", el.className);
			device.addClassToElement(el, "class1");
			assertEquals("class1", el.className);
		});
	};
	this.BrowserDeviceTest.prototype.testAddClassToElement = function(queue) {
		expectAsserts(2);

		queuedRequire(queue, ["antie/devices/browserdevice"], function(BrowserDevice) {
			var device = new BrowserDevice(antie.framework.deviceConfiguration);
			var el = device.createContainer();
			assertEquals("", el.className);
			device.addClassToElement(el, "class1");
			assertEquals("class1", el.className);
		});
	};
	this.BrowserDeviceTest.prototype.testAddKeyEventListener = function(queue) {
		expectAsserts(3);

		queuedRequire(queue, ["antie/devices/browserdevice"], function(BrowserDevice) {
			var device = new BrowserDevice(antie.framework.deviceConfiguration);
			document.onkeydown = null;
			document.onkeypress = null;
			document.onkeyup = null;
			device.addKeyEventListener();
			assertFunction(document.onkeydown);
			assertFunction(document.onkeypress);
			assertFunction(document.onkeyup);
		});
	};
	this.BrowserDeviceTest.prototype.testGetElementSize = function(queue) {
		expectAsserts(2);

		queuedRequire(queue, ["antie/devices/browserdevice"], function(BrowserDevice) {
			var device = new BrowserDevice(antie.framework.deviceConfiguration);
			var el = device.createContainer();
			device.appendChildElement(document.body, el);
			el.style.width = "100px";
			el.style.height = "200px";
			el.style.position = "absolute";
			var size = device.getElementSize(el);
			assertEquals(100, size.width);
			assertEquals(200, size.height);
		});
	};
	this.BrowserDeviceTest.prototype.testSetElementSize = function(queue) {
		expectAsserts(2);

		queuedRequire(queue, ["antie/devices/browserdevice"], function(BrowserDevice) {
			var device = new BrowserDevice(antie.framework.deviceConfiguration);
			var el = device.createContainer();
			device.appendChildElement(document.body, el);
			el.style.position = "absolute";
			device.setElementSize(el, {width:300, height:400});
			assertEquals("300px", el.style.width);
			assertEquals("400px", el.style.height);
		});
	};
	this.BrowserDeviceTest.prototype.testSetElementPosition = function(queue) {
		expectAsserts(2);

		queuedRequire(queue, ["antie/devices/browserdevice"], function(BrowserDevice) {
			var device = new BrowserDevice(antie.framework.deviceConfiguration);
			var el = device.createContainer();
			device.appendChildElement(document.body, el);
			el.style.position = "absolute";
			device.setElementPosition(el, {top:100, left:200});
			assertEquals("100px", el.style.top);
			assertEquals("200px", el.style.left);
		});
	};
	this.BrowserDeviceTest.prototype.testGetElementOffset = function(queue) {
		expectAsserts(2);

		queuedRequire(queue, ["antie/devices/browserdevice"], function(BrowserDevice) {
			var device = new BrowserDevice(antie.framework.deviceConfiguration);
			var el = device.createContainer();
			device.appendChildElement(document.body, el);
			el.style.position = "absolute";
			el.style.top = "100px";
			el.style.left = "200px";
			var pos = device.getElementOffset(el);
			assertEquals(100, pos.top);
			assertEquals(200, pos.left);
		});
	};
	this.BrowserDeviceTest.prototype.testGetElementOffset = function(queue) {
		expectAsserts(2);

		queuedRequire(queue, ["antie/devices/browserdevice"], function(BrowserDevice) {
			var device = new BrowserDevice(antie.framework.deviceConfiguration);
			var el = device.createContainer();
			device.appendChildElement(document.body, el);
			el.style.position = "absolute";
			device.setElementPosition(el, {top:100, left:200});
			var offset = device.getElementOffset(el);
			assertEquals(100, offset.top);
			assertEquals(200, offset.left);
		});
	};
	this.BrowserDeviceTest.prototype.testSetElementContent = function(queue) {
		expectAsserts(1);

		queuedRequire(queue, ["antie/devices/browserdevice"], function(BrowserDevice) {
			var device = new BrowserDevice(antie.framework.deviceConfiguration);
			var el = device.createContainer();
			device.setElementContent(el, "HELLO WORLD!");
			assertEquals("HELLO WORLD!", el.innerHTML);
		});
	};
	this.BrowserDeviceTest.prototype.testCloneElement = function(queue) {
		expectAsserts(2);

		queuedRequire(queue, ["antie/devices/browserdevice"], function(BrowserDevice) {
			var device = new BrowserDevice(antie.framework.deviceConfiguration);
			var el = device.createContainer("id");
			assertEquals("id", el.id);
			var clone = device.cloneElement(el);
			assertEquals("id", clone.id);
		});
	};
	this.BrowserDeviceTest.prototype.testCloneElement = function(queue) {
		expectAsserts(2);

		queuedRequire(queue, ["antie/devices/browserdevice"], function(BrowserDevice) {
			var device = new BrowserDevice(antie.framework.deviceConfiguration);
			var el = device.createContainer("id");
			assertEquals("id", el.id);
			var clone = device.cloneElement(el);
			assertEquals("id", clone.id);
		});
	};
	this.BrowserDeviceTest.prototype.testCloneElementDeep = function(queue) {
		expectAsserts(5);

		queuedRequire(queue, ["antie/devices/browserdevice"], function(BrowserDevice) {
			var device = new BrowserDevice(antie.framework.deviceConfiguration);
			var el = device.createContainer("id");
			var innerEl = device.createContainer("innerID");
			device.appendChildElement(el, innerEl);
			var clone = device.cloneElement(el, false);
			assertEquals("id", clone.id);
			assertEquals(0, clone.childNodes.length);
			clone = device.cloneElement(el, true);
			assertEquals("id", clone.id);
			assertEquals(1, clone.childNodes.length);
			assertEquals("innerID", clone.childNodes[0].id);
		});
	};
	this.BrowserDeviceTest.prototype.testCloneElementAppendClass = function(queue) {
		expectAsserts(9);

		queuedRequire(queue, ["antie/devices/browserdevice"], function(BrowserDevice) {
			var device = new BrowserDevice(antie.framework.deviceConfiguration);
			var el = device.createContainer("id");
			var innerEl = device.createContainer("innerID");
			device.appendChildElement(el, innerEl);
			device.setElementClasses(el, ["class1", "class2"]);
			device.setElementClasses(innerEl, ["class4"]);

			var clone = device.cloneElement(el, true);
			assertClassName("class1", clone);
			assertClassName("class2", clone);
			assertNoMatch(/class3/, clone.className);
			assertClassName("class4", clone.childNodes[0]);
			assertNoMatch(/class3/, clone.childNodes[0].className);

			clone = device.cloneElement(el, true, "class3");
			assertClassName("class1", clone);
			assertClassName("class2", clone);
			assertClassName("class3", clone);
			assertNoMatch(/class3/, clone.childNodes[0].className);
		});
	};

	this.BrowserDeviceTest.prototype.testCloneElementAppendID = function(queue) {
		expectAsserts(4);

		queuedRequire(queue, ["antie/devices/browserdevice"], function(BrowserDevice) {
			var device = new BrowserDevice(antie.framework.deviceConfiguration);
			var el = device.createContainer("id");
			var innerEl = device.createContainer("innerID");
			device.appendChildElement(el, innerEl);

			var clone = device.cloneElement(el, true);
			assertEquals("id", clone.id);
			assertEquals("innerID", clone.childNodes[0].id);

			clone = device.cloneElement(el, true, null, "_testclone");
			assertEquals("id_testclone", clone.id);
			assertEquals("innerID", clone.childNodes[0].id);
		});
	};
	this.BrowserDeviceTest.prototype.testGetTextHeight = function(queue) {
		expectAsserts(3);

		queuedRequire(queue, ["antie/devices/browserdevice"], function(BrowserDevice) {
			var device = new BrowserDevice(antie.framework.deviceConfiguration);
			assertEquals(0, device.getTextHeight("", 100, []));
			assertNotEquals(0, device.getTextHeight("HELLO", 100, []));

			var oneLine = device.getTextHeight("HELLO HELLO HELLO HELLO HELLO HELLO HELLO HELLO HELLO HELLO HELLO", 1000, []);
			var multipleLines = device.getTextHeight("HELLO HELLO HELLO HELLO HELLO HELLO HELLO HELLO HELLO HELLO HELLO", 50, []);
			assert(multipleLines > oneLine);
		});
	};
	this.BrowserDeviceTest.prototype.testGetChildElementsByTagName = function(queue) {
		expectAsserts(2);

		queuedRequire(queue, ["antie/devices/browserdevice"], function(BrowserDevice) {
			var device = new BrowserDevice(antie.framework.deviceConfiguration);
			var outer = device.createContainer();
			device.appendChildElement(outer, device.createContainer());
			device.appendChildElement(outer, device.createContainer());
			device.appendChildElement(outer, device.createLabel());
			device.appendChildElement(outer, device.createContainer());

			assertEquals(3, device.getChildElementsByTagName(outer, "div").length);
			assertEquals(1, device.getChildElementsByTagName(outer, "span").length);
		});
	};
	this.BrowserDeviceTest.prototype.testGetTopLevelElement = function(queue) {
		expectAsserts(1);

		queuedRequire(queue, ["antie/devices/browserdevice"], function(BrowserDevice) {
			var device = new BrowserDevice(antie.framework.deviceConfiguration);
			var tle = device.getTopLevelElement();
			assertEquals("html", tle.tagName.toLowerCase());
		});
	};
	this.BrowserDeviceTest.prototype.testGetScreenSize = function(queue) {
		expectAsserts(2);

		queuedRequire(queue, ["antie/devices/browserdevice"], function(BrowserDevice) {
			var device = new BrowserDevice(antie.framework.deviceConfiguration);
			var size = device.getScreenSize();
			assertNotEquals(0, size.width);
			assertNotEquals(0, size.height);
		});
	};
	this.BrowserDeviceTest.prototype.testGetCurrentRoute = function(queue) {
		expectAsserts(1);

		queuedRequire(queue, ["antie/devices/browserdevice"], function(BrowserDevice) {
			var device = new BrowserDevice(antie.framework.deviceConfiguration);
			window.location.hash = "#test1/test2/test3";
			assertEquals(["test1","test2","test3"], device.getCurrentRoute());
		});

	};
	this.BrowserDeviceTest.prototype.testSetCurrentRoute = function(queue) {
		expectAsserts(1);

		queuedRequire(queue, ["antie/devices/browserdevice"], function(BrowserDevice) {
			var device = new BrowserDevice(antie.framework.deviceConfiguration);
			device.setCurrentRoute(["test4","test5","test6"]);
			assertEquals("#test4/test5/test6", window.location.hash);
		});

	};
	this.BrowserDeviceTest.prototype.testGetReferer = function(queue) {
		expectAsserts(1);

		queuedRequire(queue, ["antie/devices/browserdevice"], function(BrowserDevice) {
			var device = new BrowserDevice(antie.framework.deviceConfiguration);
			var referrer = device.getReferrer();
			assertEquals(document.referrer, referrer);
		});

	};
	this.BrowserDeviceTest.prototype.testIsHDEnabled = function(queue) {
		expectAsserts(1);

		queuedRequire(queue, ["antie/devices/browserdevice"], function(BrowserDevice) {
			var device = new BrowserDevice(antie.framework.deviceConfiguration);
			assert(device.isHDEnabled());
		});

	};
	this.BrowserDeviceTest.prototype.testPreloadImage = function(queue) {
		expectAsserts(2);

		queuedRequire(queue, ["antie/devices/browserdevice"], function(BrowserDevice) {
			var device = new BrowserDevice(antie.framework.deviceConfiguration);
			var img = null;
			this.sandbox.stub(window, 'Image', function() {
				img = {};
				return img;
			});
			device.preloadImage("http://static.bbc.co.uk/frameworks/barlesque/1.10.0/desktop/2.7/img/blocks.png");
			assertNotNull(img);
			assertEquals("http://static.bbc.co.uk/frameworks/barlesque/1.10.0/desktop/2.7/img/blocks.png", img.src)
		});

	};
	this.BrowserDeviceTest.prototype.testScrollElementToCenter = function(queue) {
		expectAsserts(1);

		queuedRequire(queue, ["antie/devices/browserdevice"], function(BrowserDevice) {
			var device = new BrowserDevice(antie.framework.deviceConfiguration);

			this.div = device.createContainer("id_mask");
			document.body.appendChild(this.div);
			this.div.style.overflow = "hidden";
			this.div.style.width = "10px";
			this.div.style.height = "10px";
			this.div.style.position = "absolute";
			var inner = device.createContainer("id");
			inner.style.position = "absolute";
			inner.style.top = 0;
			inner.style.left = 0;
			inner.style.width = "1000px";
			inner.style.height = "1000px";
			device.appendChildElement(this.div, inner);

			var scrollElementToSpy = this.sandbox.spy(device, 'scrollElementTo');
			device.scrollElementToCenter(this.div, 100, 100);
			assert(scrollElementToSpy.calledWith(this.div, 95, 95));
			this.div.parentNode.removeChild(this.div);
			this.div = null;
		});

	};
})();