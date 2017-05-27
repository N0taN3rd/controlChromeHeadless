let it = {
  Inspector: {
    domain: 'Inspector',
    experimental: true,
    types: [],
    commands: [ {
      name: 'enable',
      description: 'Enables inspector domain notifications.'
    },
    {
      name: 'disable',
      description: 'Disables inspector domain notifications.'
    } ],
    events: [ {
      name: 'detached',
      description: 'Fired when remote debugging connection is about to be terminated. Contains detach reason.',
      parameters: [ {
        type: 'string',
        description: 'The reason why connection has been terminated.'
      } ]
    },
    {
      name: 'targetCrashed',
      description: 'Fired when debugging target has crashed'
    } ]
  },
  Memory: {
    domain: 'Memory',
    experimental: true,
    types: [ {
      id: 'PressureLevel',
      type: 'string',
      enum: [ 'moderate', 'critical' ],
      description: 'Memory pressure level.'
    } ],
    commands: [ {
      name: 'getDOMCounters',
      returns: [ { name: 'documents', type: 'integer' },
        { name: 'nodes', type: 'integer' },
        { name: 'jsEventListeners', type: 'integer' } ]
    },
    {
      name: 'setPressureNotificationsSuppressed',
      description: 'Enable/disable suppressing memory pressure notifications in all processes.',
      parameters: [ {
        type: 'boolean',
        description: 'If true, memory pressure notifications will be suppressed.'
      } ]
    },
    {
      name: 'simulatePressureNotification',
      description: 'Simulate a memory pressure notification in all processes.',
      parameters: [ {
        '$ref': 'PressureLevel',
        description: 'Memory pressure level of the notification.'
      } ]
    } ]
  },
  Page: {
    domain: 'Page',
    description: 'Actions and events related to the inspected page belong to the page domain.',
    dependencies: [ 'Debugger', 'DOM' ],
    types: [ {
      id: 'ResourceType',
      type: 'string',
      enum: [ 'Document',
        'Stylesheet',
        'Image',
        'Media',
        'Font',
        'Script',
        'TextTrack',
        'XHR',
        'Fetch',
        'EventSource',
        'WebSocket',
        'Manifest',
        'Other' ],
      description: 'Resource type as it was perceived by the rendering engine.'
    },
    {
      id: 'FrameId',
      type: 'string',
      description: 'Unique frame identifier.'
    },
    {
      id: 'Frame',
      type: 'object',
      description: 'Information about the Frame on the page.',
      properties: [ { type: 'string', description: 'Frame unique identifier.' },
        {
          type: 'string',
          optional: true,
          description: 'Parent frame identifier.'
        },
        {
          '$ref': 'Network.LoaderId',
          description: 'Identifier of the loader associated with this frame.'
        },
        {
          type: 'string',
          optional: true,
          description: 'Frame\'s name as specified in the tag.'
        },
          { type: 'string', description: 'Frame document\'s URL.' },
        {
          type: 'string',
          description: 'Frame document\'s security origin.'
        },
        {
          type: 'string',
          description: 'Frame document\'s mimeType as determined by the browser.'
        } ]
    },
    {
      id: 'FrameResource',
      type: 'object',
      description: 'Information about the Resource on the page.',
      properties: [ { type: 'string', description: 'Resource URL.' },
        {
          '$ref': 'ResourceType',
          description: 'Type of this resource.'
        },
        {
          type: 'string',
          description: 'Resource mimeType as determined by the browser.'
        },
        {
          '$ref': 'Network.Timestamp',
          description: 'last-modified timestamp as reported by server.',
          optional: true
        },
        {
          type: 'number',
          description: 'Resource content size.',
          optional: true
        },
        {
          type: 'boolean',
          optional: true,
          description: 'True if the resource failed to load.'
        },
        {
          type: 'boolean',
          optional: true,
          description: 'True if the resource was canceled during loading.'
        } ],
      experimental: true
    },
    {
      id: 'FrameResourceTree',
      type: 'object',
      description: 'Information about the Frame hierarchy along with their cached resources.',
      properties: [ {
        '$ref': 'Frame',
        description: 'Frame information for this tree item.'
      },
      {
        type: 'array',
        optional: true,
        items: { '$ref': 'FrameResourceTree' },
        description: 'Child frames.'
      },
      {
        type: 'array',
        items: { '$ref': 'FrameResource' },
        description: 'Information about frame resources.'
      } ],
      experimental: true
    },
    {
      id: 'ScriptIdentifier',
      type: 'string',
      description: 'Unique script identifier.',
      experimental: true
    },
    {
      id: 'NavigationEntry',
      type: 'object',
      description: 'Navigation history entry.',
      properties: [ {
        type: 'integer',
        description: 'Unique id of the navigation history entry.'
      },
      {
        type: 'string',
        description: 'URL of the navigation history entry.'
      },
      {
        type: 'string',
        description: 'Title of the navigation history entry.'
      } ],
      experimental: true
    },
    {
      id: 'ScreencastFrameMetadata',
      type: 'object',
      description: 'Screencast frame metadata.',
      properties: [ {
        type: 'number',
        experimental: true,
        description: 'Top offset in DIP.'
      },
      {
        type: 'number',
        experimental: true,
        description: 'Page scale factor.'
      },
      {
        type: 'number',
        experimental: true,
        description: 'Device screen width in DIP.'
      },
      {
        type: 'number',
        experimental: true,
        description: 'Device screen height in DIP.'
      },
      {
        type: 'number',
        experimental: true,
        description: 'Position of horizontal scroll in CSS pixels.'
      },
      {
        type: 'number',
        experimental: true,
        description: 'Position of vertical scroll in CSS pixels.'
      },
      {
        type: 'number',
        optional: true,
        experimental: true,
        description: 'Frame swap timestamp.'
      } ],
      experimental: true
    },
    {
      id: 'DialogType',
      description: 'Javascript dialog type.',
      type: 'string',
      enum: [ 'alert', 'confirm', 'prompt', 'beforeunload' ],
      experimental: true
    },
    {
      id: 'AppManifestError',
      description: 'Error while paring app manifest.',
      type: 'object',
      properties: [ { type: 'string', description: 'Error message.' },
        {
          type: 'integer',
          description: 'If criticial, this is a non-recoverable parse error.'
        },
          { type: 'integer', description: 'Error line.' },
          { type: 'integer', description: 'Error column.' } ],
      experimental: true
    },
    {
      id: 'NavigationResponse',
      description: 'Proceed: allow the navigation; Cancel: cancel the navigation; CancelAndIgnore: cancels the navigation and makes the requester of the navigation acts like the request was never made.',
      type: 'string',
      enum: [ 'Proceed', 'Cancel', 'CancelAndIgnore' ],
      experimental: true
    },
    {
      id: 'LayoutViewport',
      type: 'object',
      description: 'Layout viewport position and dimensions.',
      experimental: true,
      properties: [ {
        type: 'integer',
        description: 'Horizontal offset relative to the document (CSS pixels).'
      },
      {
        type: 'integer',
        description: 'Vertical offset relative to the document (CSS pixels).'
      },
      {
        type: 'integer',
        description: 'Width (CSS pixels), excludes scrollbar if present.'
      },
      {
        type: 'integer',
        description: 'Height (CSS pixels), excludes scrollbar if present.'
      } ]
    },
    {
      id: 'VisualViewport',
      type: 'object',
      description: 'Visual viewport position, dimensions, and scale.',
      experimental: true,
      properties: [ {
        type: 'number',
        description: 'Horizontal offset relative to the layout viewport (CSS pixels).'
      },
      {
        type: 'number',
        description: 'Vertical offset relative to the layout viewport (CSS pixels).'
      },
      {
        type: 'number',
        description: 'Horizontal offset relative to the document (CSS pixels).'
      },
      {
        type: 'number',
        description: 'Vertical offset relative to the document (CSS pixels).'
      },
      {
        type: 'number',
        description: 'Width (CSS pixels), excludes scrollbar if present.'
      },
      {
        type: 'number',
        description: 'Height (CSS pixels), excludes scrollbar if present.'
      },
      {
        type: 'number',
        description: 'Scale relative to the ideal viewport (size at width=device-width).'
      } ]
    } ],
    commands: [ {
      name: 'enable',
      description: 'Enables page domain notifications.'
    },
    {
      name: 'disable',
      description: 'Disables page domain notifications.'
    },
    {
      name: 'addScriptToEvaluateOnLoad',
      parameters: [ { type: 'string' } ],
      returns: [ {
        name: 'identifier',
        '$ref': 'ScriptIdentifier',
        description: 'Identifier of the added script.'
      } ],
      experimental: true
    },
    {
      name: 'removeScriptToEvaluateOnLoad',
      parameters: [ { '$ref': 'ScriptIdentifier' } ],
      experimental: true
    },
    {
      name: 'setAutoAttachToCreatedPages',
      parameters: [ {
        type: 'boolean',
        description: 'If true, browser will open a new inspector window for every page created from this one.'
      } ],
      description: 'Controls whether browser will open a new inspector window for connected pages.',
      experimental: true
    },
    {
      name: 'reload',
      parameters: [ {
        type: 'boolean',
        optional: true,
        description: 'If true, browser cache is ignored (as if the user pressed Shift+refresh).'
      },
      {
        type: 'string',
        optional: true,
        description: 'If set, the script will be injected into all frames of the inspected page after reload.'
      } ],
      description: 'Reloads given page optionally ignoring the cache.'
    },
    {
      name: 'navigate',
      parameters: [ { type: 'string', description: 'URL to navigate the page to.' },
        {
          type: 'string',
          optional: true,
          experimental: true,
          description: 'Referrer URL.'
        } ],
      returns: [ {
        name: 'frameId',
        '$ref': 'FrameId',
        experimental: true,
        description: 'Frame id that will be navigated.'
      } ],
      description: 'Navigates current page to the given URL.'
    },
    {
      name: 'stopLoading',
      description: 'Force the page stop all navigations and pending resource fetches.',
      experimental: true
    },
    {
      name: 'getNavigationHistory',
      returns: [ {
        name: 'currentIndex',
        type: 'integer',
        description: 'Index of the current navigation history entry.'
      },
      {
        name: 'entries',
        type: 'array',
        items: { '$ref': 'NavigationEntry' },
        description: 'Array of navigation history entries.'
      } ],
      description: 'Returns navigation history for the current page.',
      experimental: true
    },
    {
      name: 'navigateToHistoryEntry',
      parameters: [ {
        type: 'integer',
        description: 'Unique id of the entry to navigate to.'
      } ],
      description: 'Navigates current page to the given history entry.',
      experimental: true
    },
    {
      name: 'getCookies',
      returns: [ {
        name: 'cookies',
        type: 'array',
        items: { '$ref': 'Network.Cookie' },
        description: 'Array of cookie objects.'
      } ],
      description: 'Returns all browser cookies. Depending on the backend support, will return detailed cookie information in the <code>cookies</code> field.',
      experimental: true,
      redirect: 'Network'
    },
    {
      name: 'deleteCookie',
      parameters: [ { type: 'string', description: 'Name of the cookie to remove.' },
        {
          type: 'string',
          description: 'URL to match cooke domain and path.'
        } ],
      description: 'Deletes browser cookie with given name, domain and path.',
      experimental: true,
      redirect: 'Network'
    },
    {
      name: 'getResourceTree',
      description: 'Returns present frame / resource tree structure.',
      returns: [ {
        name: 'frameTree',
        '$ref': 'FrameResourceTree',
        description: 'Present frame / resource tree structure.'
      } ],
      experimental: true
    },
    {
      name: 'getResourceContent',
      description: 'Returns content of the given resource.',
      parameters: [ {
        '$ref': 'FrameId',
        description: 'Frame id to get resource for.'
      },
      {
        type: 'string',
        description: 'URL of the resource to get content for.'
      } ],
      returns: [ {
        name: 'content',
        type: 'string',
        description: 'Resource content.'
      },
      {
        name: 'base64Encoded',
        type: 'boolean',
        description: 'True, if content was served as base64.'
      } ],
      experimental: true
    },
    {
      name: 'searchInResource',
      description: 'Searches for given string in resource content.',
      parameters: [ {
        '$ref': 'FrameId',
        description: 'Frame id for resource to search in.'
      },
      {
        type: 'string',
        description: 'URL of the resource to search in.'
      },
          { type: 'string', description: 'String to search for.' },
      {
        type: 'boolean',
        optional: true,
        description: 'If true, search is case sensitive.'
      },
      {
        type: 'boolean',
        optional: true,
        description: 'If true, treats string parameter as regex.'
      } ],
      returns: [ {
        name: 'result',
        type: 'array',
        items: { '$ref': 'Debugger.SearchMatch' },
        description: 'List of search matches.'
      } ],
      experimental: true
    },
    {
      name: 'setDocumentContent',
      description: 'Sets given markup as the document\'s HTML.',
      parameters: [ { '$ref': 'FrameId', description: 'Frame id to set HTML for.' },
          { type: 'string', description: 'HTML content to set.' } ],
      experimental: true
    },
    {
      name: 'setDeviceMetricsOverride',
      description: 'Overrides the values of device screen dimensions (window.screen.width, window.screen.height, window.innerWidth, window.innerHeight, and "device-width"/"device-height"-related CSS media query results).',
      parameters: [ {
        type: 'integer',
        description: 'Overriding width value in pixels (minimum 0, maximum 10000000). 0 disables the override.'
      },
      {
        type: 'integer',
        description: 'Overriding height value in pixels (minimum 0, maximum 10000000). 0 disables the override.'
      },
      {
        type: 'number',
        description: 'Overriding device scale factor value. 0 disables the override.'
      },
      {
        type: 'boolean',
        description: 'Whether to emulate mobile device. This includes viewport meta tag, overlay scrollbars, text autosizing and more.'
      },
      {
        type: 'boolean',
        description: 'Whether a view that exceeds the available browser window area should be scaled down to fit.'
      },
      {
        type: 'number',
        optional: true,
        description: 'Scale to apply to resulting view image. Ignored in |fitWindow| mode.'
      },
      {
        type: 'number',
        optional: true,
        description: 'X offset to shift resulting view image by. Ignored in |fitWindow| mode.'
      },
      {
        type: 'number',
        optional: true,
        description: 'Y offset to shift resulting view image by. Ignored in |fitWindow| mode.'
      },
      {
        type: 'integer',
        optional: true,
        description: 'Overriding screen width value in pixels (minimum 0, maximum 10000000). Only used for |mobile==true|.'
      },
      {
        type: 'integer',
        optional: true,
        description: 'Overriding screen height value in pixels (minimum 0, maximum 10000000). Only used for |mobile==true|.'
      },
      {
        type: 'integer',
        optional: true,
        description: 'Overriding view X position on screen in pixels (minimum 0, maximum 10000000). Only used for |mobile==true|.'
      },
      {
        type: 'integer',
        optional: true,
        description: 'Overriding view Y position on screen in pixels (minimum 0, maximum 10000000). Only used for |mobile==true|.'
      },
      {
        '$ref': 'Emulation.ScreenOrientation',
        optional: true,
        description: 'Screen orientation override.'
      } ],
      redirect: 'Emulation',
      experimental: true
    },
    {
      name: 'clearDeviceMetricsOverride',
      description: 'Clears the overriden device metrics.',
      redirect: 'Emulation',
      experimental: true
    },
    {
      name: 'setGeolocationOverride',
      description: 'Overrides the Geolocation Position or Error. Omitting any of the parameters emulates position unavailable.',
      parameters: [ { type: 'number', optional: true, description: 'Mock latitude' },
          { type: 'number', optional: true, description: 'Mock longitude' },
          { type: 'number', optional: true, description: 'Mock accuracy' } ],
      redirect: 'Emulation'
    },
    {
      name: 'clearGeolocationOverride',
      description: 'Clears the overriden Geolocation Position and Error.',
      redirect: 'Emulation'
    },
    {
      name: 'setDeviceOrientationOverride',
      description: 'Overrides the Device Orientation.',
      parameters: [ { type: 'number', description: 'Mock alpha' },
          { type: 'number', description: 'Mock beta' },
          { type: 'number', description: 'Mock gamma' } ],
      redirect: 'DeviceOrientation',
      experimental: true
    },
    {
      name: 'clearDeviceOrientationOverride',
      description: 'Clears the overridden Device Orientation.',
      redirect: 'DeviceOrientation',
      experimental: true
    },
    {
      name: 'setTouchEmulationEnabled',
      parameters: [ {
        type: 'boolean',
        description: 'Whether the touch event emulation should be enabled.'
      },
      {
        type: 'string',
        enum: [ 'mobile', 'desktop' ],
        optional: true,
        description: 'Touch/gesture events configuration. Default: current platform.'
      } ],
      description: 'Toggles mouse event-based touch event emulation.',
      experimental: true,
      redirect: 'Emulation'
    },
    {
      name: 'captureScreenshot',
      description: 'Capture page screenshot.',
      parameters: [ {
        type: 'string',
        optional: true,
        enum: [ 'jpeg', 'png' ],
        description: 'Image compression format (defaults to png).'
      },
      {
        type: 'integer',
        optional: true,
        description: 'Compression quality from range [0..100] (jpeg only).'
      },
      {
        type: 'boolean',
        optional: true,
        description: 'Capture the screenshot from the surface, rather than the view. Defaults to false.',
        experimental: true
      } ],
      returns: [ {
        name: 'data',
        type: 'string',
        description: 'Base64-encoded image data.'
      } ],
      experimental: true
    },
    {
      name: 'printToPDF',
      description: 'Print page as pdf.',
      returns: [ {
        name: 'data',
        type: 'string',
        description: 'Base64-encoded pdf data.'
      } ],
      experimental: true
    },
    {
      name: 'startScreencast',
      description: 'Starts sending each frame using the <code>screencastFrame</code> event.',
      parameters: [ {
        type: 'string',
        optional: true,
        enum: [ 'jpeg', 'png' ],
        description: 'Image compression format.'
      },
      {
        type: 'integer',
        optional: true,
        description: 'Compression quality from range [0..100].'
      },
      {
        type: 'integer',
        optional: true,
        description: 'Maximum screenshot width.'
      },
      {
        type: 'integer',
        optional: true,
        description: 'Maximum screenshot height.'
      },
      {
        type: 'integer',
        optional: true,
        description: 'Send every n-th frame.'
      } ],
      experimental: true
    },
    {
      name: 'stopScreencast',
      description: 'Stops sending each frame in the <code>screencastFrame</code>.',
      experimental: true
    },
    {
      name: 'screencastFrameAck',
      description: 'Acknowledges that a screencast frame has been received by the frontend.',
      parameters: [ { type: 'integer', description: 'Frame number.' } ],
      experimental: true
    },
    {
      name: 'handleJavaScriptDialog',
      description: 'Accepts or dismisses a JavaScript initiated dialog (alert, confirm, prompt, or onbeforeunload).',
      parameters: [ {
        type: 'boolean',
        description: 'Whether to accept or dismiss the dialog.'
      },
      {
        type: 'string',
        optional: true,
        description: 'The text to enter into the dialog prompt before accepting. Used only if this is a prompt dialog.'
      } ]
    },
    {
      name: 'setColorPickerEnabled',
      parameters: [ { type: 'boolean', description: 'Shows / hides color picker' } ],
      description: 'Shows / hides color picker',
      experimental: true
    },
    {
      name: 'configureOverlay',
      parameters: [ {
        type: 'boolean',
        optional: true,
        description: 'Whether overlay should be suspended and not consume any resources.'
      },
      {
        type: 'string',
        optional: true,
        description: 'Overlay message to display.'
      } ],
      experimental: true,
      description: 'Configures overlay.'
    },
    {
      name: 'getAppManifest',
      experimental: true,
      returns: [ {
        name: 'url',
        type: 'string',
        description: 'Manifest location.'
      },
      {
        name: 'errors',
        type: 'array',
        items: { '$ref': 'AppManifestError' }
      },
      {
        name: 'data',
        type: 'string',
        optional: true,
        description: 'Manifest content.'
      } ]
    },
      { name: 'requestAppBanner', experimental: true },
    {
      name: 'setControlNavigations',
      parameters: [ { type: 'boolean' } ],
      description: 'Toggles navigation throttling which allows programatic control over navigation and redirect response.',
      experimental: true
    },
    {
      name: 'processNavigation',
      parameters: [ { '$ref': 'NavigationResponse' }, { type: 'integer' } ],
      description: 'Should be sent in response to a navigationRequested or a redirectRequested event, telling the browser how to handle the navigation.',
      experimental: true
    },
    {
      name: 'getLayoutMetrics',
      description: 'Returns metrics relating to the layouting of the page, such as viewport bounds/scale.',
      experimental: true,
      returns: [ {
        name: 'layoutViewport',
        '$ref': 'LayoutViewport',
        description: 'Metrics relating to the layout viewport.'
      },
      {
        name: 'visualViewport',
        '$ref': 'VisualViewport',
        description: 'Metrics relating to the visual viewport.'
      },
      {
        name: 'contentSize',
        '$ref': 'DOM.Rect',
        description: 'Size of scrollable area.'
      } ]
    } ],
    events: [ {
      name: 'domContentEventFired',
      parameters: [ { type: 'number' } ]
    },
      { name: 'loadEventFired', parameters: [ { type: 'number' } ] },
    {
      name: 'frameAttached',
      description: 'Fired when frame has been attached to its parent.',
      parameters: [ {
        '$ref': 'FrameId',
        description: 'Id of the frame that has been attached.'
      },
          { '$ref': 'FrameId', description: 'Parent frame identifier.' },
      {
        '$ref': 'Runtime.StackTrace',
        optional: true,
        description: 'JavaScript stack trace of when frame was attached, only set if frame initiated from script.',
        experimental: true
      } ]
    },
    {
      name: 'frameNavigated',
      description: 'Fired once navigation of the frame has completed. Frame is now associated with the new loader.',
      parameters: [ { '$ref': 'Frame', description: 'Frame object.' } ]
    },
    {
      name: 'frameDetached',
      description: 'Fired when frame has been detached from its parent.',
      parameters: [ {
        '$ref': 'FrameId',
        description: 'Id of the frame that has been detached.'
      } ]
    },
    {
      name: 'frameStartedLoading',
      description: 'Fired when frame has started loading.',
      parameters: [ {
        '$ref': 'FrameId',
        description: 'Id of the frame that has started loading.'
      } ],
      experimental: true
    },
    {
      name: 'frameStoppedLoading',
      description: 'Fired when frame has stopped loading.',
      parameters: [ {
        '$ref': 'FrameId',
        description: 'Id of the frame that has stopped loading.'
      } ],
      experimental: true
    },
    {
      name: 'frameScheduledNavigation',
      description: 'Fired when frame schedules a potential navigation.',
      parameters: [ {
        '$ref': 'FrameId',
        description: 'Id of the frame that has scheduled a navigation.'
      },
      {
        type: 'number',
        description: 'Delay (in seconds) until the navigation is scheduled to begin. The navigation is not guaranteed to start.'
      } ],
      experimental: true
    },
    {
      name: 'frameClearedScheduledNavigation',
      description: 'Fired when frame no longer has a scheduled navigation.',
      parameters: [ {
        '$ref': 'FrameId',
        description: 'Id of the frame that has cleared its scheduled navigation.'
      } ],
      experimental: true
    },
      { name: 'frameResized', experimental: true },
    {
      name: 'javascriptDialogOpening',
      description: 'Fired when a JavaScript initiated dialog (alert, confirm, prompt, or onbeforeunload) is about to open.',
      parameters: [ {
        type: 'string',
        description: 'Message that will be displayed by the dialog.'
      },
          { '$ref': 'DialogType', description: 'Dialog type.' } ]
    },
    {
      name: 'javascriptDialogClosed',
      description: 'Fired when a JavaScript initiated dialog (alert, confirm, prompt, or onbeforeunload) has been closed.',
      parameters: [ {
        type: 'boolean',
        description: 'Whether dialog was confirmed.'
      } ]
    },
    {
      name: 'screencastFrame',
      description: 'Compressed image data requested by the <code>startScreencast</code>.',
      parameters: [ {
        type: 'string',
        description: 'Base64-encoded compressed image.'
      },
      {
        '$ref': 'ScreencastFrameMetadata',
        description: 'Screencast frame metadata.'
      },
          { type: 'integer', description: 'Frame number.' } ],
      experimental: true
    },
    {
      name: 'screencastVisibilityChanged',
      description: 'Fired when the page with currently enabled screencast was shown or hidden </code>.',
      parameters: [ { type: 'boolean', description: 'True if the page is visible.' } ],
      experimental: true
    },
    {
      name: 'colorPicked',
      description: 'Fired when a color has been picked.',
      parameters: [ { '$ref': 'DOM.RGBA', description: 'RGBA of the picked color.' } ],
      experimental: true
    },
    {
      name: 'interstitialShown',
      description: 'Fired when interstitial page was shown'
    },
    {
      name: 'interstitialHidden',
      description: 'Fired when interstitial page was hidden'
    },
    {
      name: 'navigationRequested',
      description: 'Fired when a navigation is started if navigation throttles are enabled.  The navigation will be deferred until processNavigation is called.',
      parameters: [ {
        type: 'boolean',
        description: 'Whether the navigation is taking place in the main frame or in a subframe.'
      },
      {
        type: 'boolean',
        description: 'Whether the navigation has encountered a server redirect or not.'
      },
          { type: 'integer' },
          { type: 'string', description: 'URL of requested navigation.' } ]
    } ]
  },
  Rendering: {
    domain: 'Rendering',
    description: 'This domain allows to control rendering of the page.',
    experimental: true,
    commands: [ {
      name: 'setShowPaintRects',
      description: 'Requests that backend shows paint rectangles',
      parameters: [ {
        type: 'boolean',
        description: 'True for showing paint rectangles'
      } ]
    },
    {
      name: 'setShowDebugBorders',
      description: 'Requests that backend shows debug borders on layers',
      parameters: [ {
        type: 'boolean',
        description: 'True for showing debug borders'
      } ]
    },
    {
      name: 'setShowFPSCounter',
      description: 'Requests that backend shows the FPS counter',
      parameters: [ {
        type: 'boolean',
        description: 'True for showing the FPS counter'
      } ]
    },
    {
      name: 'setShowScrollBottleneckRects',
      description: 'Requests that backend shows scroll bottleneck rects',
      parameters: [ {
        type: 'boolean',
        description: 'True for showing scroll bottleneck rects'
      } ]
    },
    {
      name: 'setShowViewportSizeOnResize',
      description: 'Paints viewport size upon main frame resize.',
      parameters: [ {
        type: 'boolean',
        description: 'Whether to paint size or not.'
      } ]
    } ]
  },
  Emulation: {
    domain: 'Emulation',
    description: 'This domain emulates different environments for the page.',
    dependencies: [ 'DOM' ],
    types: [ {
      id: 'ScreenOrientation',
      type: 'object',
      description: 'Screen orientation.',
      properties: [ {
        type: 'string',
        enum: [ 'portraitPrimary',
          'portraitSecondary',
          'landscapePrimary',
          'landscapeSecondary' ],
        description: 'Orientation type.'
      },
        { type: 'integer', description: 'Orientation angle.' } ]
    },
    {
      id: 'VirtualTimePolicy',
      type: 'string',
      enum: [ 'advance', 'pause', 'pauseIfNetworkFetchesPending' ],
      experimental: true,
      description: 'advance: If the scheduler runs out of immediate work, the virtual time base may fast forward to allow the next delayed task (if any) to run; pause: The virtual time base may not advance; pauseIfNetworkFetchesPending: The virtual time base may not advance if there are any pending resource fetches.'
    } ],
    commands: [ {
      name: 'setDeviceMetricsOverride',
      description: 'Overrides the values of device screen dimensions (window.screen.width, window.screen.height, window.innerWidth, window.innerHeight, and "device-width"/"device-height"-related CSS media query results).',
      parameters: [ {
        type: 'integer',
        description: 'Overriding width value in pixels (minimum 0, maximum 10000000). 0 disables the override.'
      },
      {
        type: 'integer',
        description: 'Overriding height value in pixels (minimum 0, maximum 10000000). 0 disables the override.'
      },
      {
        type: 'number',
        description: 'Overriding device scale factor value. 0 disables the override.'
      },
      {
        type: 'boolean',
        description: 'Whether to emulate mobile device. This includes viewport meta tag, overlay scrollbars, text autosizing and more.'
      },
      {
        type: 'boolean',
        description: 'Whether a view that exceeds the available browser window area should be scaled down to fit.'
      },
      {
        type: 'number',
        optional: true,
        experimental: true,
        description: 'Scale to apply to resulting view image. Ignored in |fitWindow| mode.'
      },
      {
        type: 'number',
        optional: true,
        deprecated: true,
        experimental: true,
        description: 'Not used.'
      },
      {
        type: 'number',
        optional: true,
        deprecated: true,
        experimental: true,
        description: 'Not used.'
      },
      {
        type: 'integer',
        optional: true,
        experimental: true,
        description: 'Overriding screen width value in pixels (minimum 0, maximum 10000000). Only used for |mobile==true|.'
      },
      {
        type: 'integer',
        optional: true,
        experimental: true,
        description: 'Overriding screen height value in pixels (minimum 0, maximum 10000000). Only used for |mobile==true|.'
      },
      {
        type: 'integer',
        optional: true,
        experimental: true,
        description: 'Overriding view X position on screen in pixels (minimum 0, maximum 10000000). Only used for |mobile==true|.'
      },
      {
        type: 'integer',
        optional: true,
        experimental: true,
        description: 'Overriding view Y position on screen in pixels (minimum 0, maximum 10000000). Only used for |mobile==true|.'
      },
      {
        '$ref': 'ScreenOrientation',
        optional: true,
        description: 'Screen orientation override.'
      } ]
    },
    {
      name: 'clearDeviceMetricsOverride',
      description: 'Clears the overriden device metrics.'
    },
    {
      name: 'forceViewport',
      description: 'Overrides the visible area of the page. The change is hidden from the page, i.e. the observable scroll position and page scale does not change. In effect, the command moves the specified area of the page into the top-left corner of the frame.',
      experimental: true,
      parameters: [ {
        type: 'number',
        description: 'X coordinate of top-left corner of the area (CSS pixels).'
      },
      {
        type: 'number',
        description: 'Y coordinate of top-left corner of the area (CSS pixels).'
      },
      {
        type: 'number',
        description: 'Scale to apply to the area (relative to a page scale of 1.0).'
      } ]
    },
    {
      name: 'resetViewport',
      description: 'Resets the visible area of the page to the original viewport, undoing any effects of the <code>forceViewport</code> command.',
      experimental: true
    },
    {
      name: 'resetPageScaleFactor',
      experimental: true,
      description: 'Requests that page scale factor is reset to initial values.'
    },
    {
      name: 'setPageScaleFactor',
      description: 'Sets a specified page scale factor.',
      experimental: true,
      parameters: [ { type: 'number', description: 'Page scale factor.' } ]
    },
    {
      name: 'setVisibleSize',
      description: 'Resizes the frame/viewport of the page. Note that this does not affect the frame\'s container (e.g. browser window). Can be used to produce screenshots of the specified size. Not supported on Android.',
      experimental: true,
      parameters: [ { type: 'integer', description: 'Frame width (DIP).' },
          { type: 'integer', description: 'Frame height (DIP).' } ]
    },
    {
      name: 'setScriptExecutionDisabled',
      description: 'Switches script execution in the page.',
      experimental: true,
      parameters: [ {
        type: 'boolean',
        description: 'Whether script execution should be disabled in the page.'
      } ]
    },
    {
      name: 'setGeolocationOverride',
      description: 'Overrides the Geolocation Position or Error. Omitting any of the parameters emulates position unavailable.',
      experimental: true,
      parameters: [ { type: 'number', optional: true, description: 'Mock latitude' },
          { type: 'number', optional: true, description: 'Mock longitude' },
          { type: 'number', optional: true, description: 'Mock accuracy' } ]
    },
    {
      name: 'clearGeolocationOverride',
      description: 'Clears the overriden Geolocation Position and Error.',
      experimental: true
    },
    {
      name: 'setTouchEmulationEnabled',
      parameters: [ {
        type: 'boolean',
        description: 'Whether the touch event emulation should be enabled.'
      },
      {
        type: 'string',
        enum: [ 'mobile', 'desktop' ],
        optional: true,
        description: 'Touch/gesture events configuration. Default: current platform.'
      } ],
      description: 'Toggles mouse event-based touch event emulation.'
    },
    {
      name: 'setEmulatedMedia',
      parameters: [ {
        type: 'string',
        description: 'Media type to emulate. Empty string disables the override.'
      } ],
      description: 'Emulates the given media for CSS media queries.'
    },
    {
      name: 'setCPUThrottlingRate',
      parameters: [ {
        type: 'number',
        description: 'Throttling rate as a slowdown factor (1 is no throttle, 2 is 2x slowdown, etc).'
      } ],
      experimental: true,
      description: 'Enables CPU throttling to emulate slow CPUs.'
    },
    {
      name: 'canEmulate',
      description: 'Tells whether emulation is supported.',
      returns: [ {
        name: 'result',
        type: 'boolean',
        description: 'True if emulation is supported.'
      } ],
      experimental: true
    },
    {
      name: 'setVirtualTimePolicy',
      description: 'Turns on virtual time for all frames (replacing real-time with a synthetic time source) and sets the current virtual time policy.  Note this supersedes any previous time budget.',
      parameters: [ { '$ref': 'VirtualTimePolicy' },
        {
          type: 'integer',
          optional: true,
          description: 'If set, after this many virtual milliseconds have elapsed virtual time will be paused and a virtualTimeBudgetExpired event is sent.'
        } ],
      experimental: true
    },
    {
      name: 'setDefaultBackgroundColorOverride',
      description: 'Sets or clears an override of the default background color of the frame. This override is used if the content does not specify one.',
      parameters: [ {
        '$ref': 'DOM.RGBA',
        optional: true,
        description: 'RGBA of the default background color. If not specified, any existing override will be cleared.'
      } ],
      experimental: true
    } ],
    events: [ {
      name: 'virtualTimeBudgetExpired',
      experimental: true,
      description: 'Notification sent after the virual time budget for the current VirtualTimePolicy has run out.'
    } ]
  },
  Security: {
    domain: 'Security',
    description: 'Security',
    experimental: true,
    types: [ {
      id: 'CertificateId',
      type: 'integer',
      description: 'An internal certificate ID value.'
    },
    {
      id: 'SecurityState',
      type: 'string',
      enum: [ 'unknown', 'neutral', 'insecure', 'warning', 'secure', 'info' ],
      description: 'The security level of a page or resource.'
    },
    {
      id: 'SecurityStateExplanation',
      type: 'object',
      properties: [ {
        '$ref': 'SecurityState',
        description: 'Security state representing the severity of the factor being explained.'
      },
      {
        type: 'string',
        description: 'Short phrase describing the type of factor.'
      },
      {
        type: 'string',
        description: 'Full text explanation of the factor.'
      },
      {
        type: 'boolean',
        description: 'True if the page has a certificate.'
      } ],
      description: 'An explanation of an factor contributing to the security state.'
    },
    {
      id: 'InsecureContentStatus',
      type: 'object',
      properties: [ {
        type: 'boolean',
        description: 'True if the page was loaded over HTTPS and ran mixed (HTTP) content such as scripts.'
      },
      {
        type: 'boolean',
        description: 'True if the page was loaded over HTTPS and displayed mixed (HTTP) content such as images.'
      },
      {
        type: 'boolean',
        description: 'True if the page was loaded over HTTPS and contained a form targeting an insecure url.'
      },
      {
        type: 'boolean',
        description: 'True if the page was loaded over HTTPS without certificate errors, and ran content such as scripts that were loaded with certificate errors.'
      },
      {
        type: 'boolean',
        description: 'True if the page was loaded over HTTPS without certificate errors, and displayed content such as images that were loaded with certificate errors.'
      },
      {
        '$ref': 'SecurityState',
        description: 'Security state representing a page that ran insecure content.'
      },
      {
        '$ref': 'SecurityState',
        description: 'Security state representing a page that displayed insecure content.'
      } ],
      description: 'Information about insecure content on the page.'
    },
    {
      id: 'CertificateErrorAction',
      type: 'string',
      enum: [ 'continue', 'cancel' ],
      description: 'The action to take when a certificate error occurs. continue will continue processing the request and cancel will cancel the request.'
    } ],
    commands: [ {
      name: 'enable',
      description: 'Enables tracking security state changes.'
    },
    {
      name: 'disable',
      description: 'Disables tracking security state changes.'
    },
    {
      name: 'showCertificateViewer',
      description: 'Displays native dialog with the certificate details.'
    },
    {
      name: 'handleCertificateError',
      description: 'Handles a certificate error that fired a certificateError event.',
      parameters: [ { type: 'integer', description: 'The ID of the event.' },
        {
          '$ref': 'CertificateErrorAction',
          description: 'The action to take on the certificate error.'
        } ]
    },
    {
      name: 'setOverrideCertificateErrors',
      description: 'Enable/disable overriding certificate errors. If enabled, all certificate error events need to be handled by the DevTools client and should be answered with handleCertificateError commands.',
      parameters: [ {
        type: 'boolean',
        description: 'If true, certificate errors will be overridden.'
      } ]
    } ],
    events: [ {
      name: 'securityStateChanged',
      description: 'The security state of the page changed.',
      parameters: [ { '$ref': 'SecurityState', description: 'Security state.' },
        {
          type: 'boolean',
          description: 'True if the page was loaded over cryptographic transport such as HTTPS.'
        },
        {
          type: 'array',
          items: { '$ref': 'SecurityStateExplanation' },
          description: 'List of explanations for the security state. If the overall security state is `insecure` or `warning`, at least one corresponding explanation should be included.'
        },
        {
          '$ref': 'InsecureContentStatus',
          description: 'Information about insecure content on the page.'
        },
        {
          type: 'string',
          description: 'Overrides user-visible description of the state.',
          optional: true
        } ]
    },
    {
      name: 'certificateError',
      description: 'There is a certificate error. If overriding certificate errors is enabled, then it should be handled with the handleCertificateError command. Note: this event does not fire if the certificate error has been allowed internally.',
      parameters: [ { type: 'integer', description: 'The ID of the event.' },
          { type: 'string', description: 'The type of the error.' },
          { type: 'string', description: 'The url that was requested.' } ]
    } ]
  },
  Network: {
    domain: 'Network',
    description: 'Network domain allows tracking network activities of the page. It exposes information about http, file, data and other requests and responses, their headers, bodies, timing, etc.',
    dependencies: [ 'Runtime', 'Security' ],
    types: [ {
      id: 'LoaderId',
      type: 'string',
      description: 'Unique loader identifier.'
    },
    {
      id: 'RequestId',
      type: 'string',
      description: 'Unique request identifier.'
    },
    {
      id: 'Timestamp',
      type: 'number',
      description: 'Number of seconds since epoch.'
    },
    {
      id: 'Headers',
      type: 'object',
      description: 'Request / response headers as keys / values of JSON object.'
    },
    {
      id: 'ConnectionType',
      type: 'string',
      enum: [ 'none',
        'cellular2g',
        'cellular3g',
        'cellular4g',
        'bluetooth',
        'ethernet',
        'wifi',
        'wimax',
        'other' ],
      description: 'Loading priority of a resource request.'
    },
    {
      id: 'CookieSameSite',
      type: 'string',
      enum: [ 'Strict', 'Lax' ],
      description: 'Represents the cookie\'s \'SameSite\' status: https://tools.ietf.org/html/draft-west-first-party-cookies'
    },
    {
      id: 'ResourceTiming',
      type: 'object',
      description: 'Timing information for the request.',
      properties: [ {
        type: 'number',
        description: 'Timing\'s requestTime is a baseline in seconds, while the other numbers are ticks in milliseconds relatively to this requestTime.'
      },
          { type: 'number', description: 'Started resolving proxy.' },
          { type: 'number', description: 'Finished resolving proxy.' },
          { type: 'number', description: 'Started DNS address resolve.' },
          { type: 'number', description: 'Finished DNS address resolve.' },
      {
        type: 'number',
        description: 'Started connecting to the remote host.'
      },
          { type: 'number', description: 'Connected to the remote host.' },
          { type: 'number', description: 'Started SSL handshake.' },
          { type: 'number', description: 'Finished SSL handshake.' },
      {
        type: 'number',
        description: 'Started running ServiceWorker.',
        experimental: true
      },
      {
        type: 'number',
        description: 'Finished Starting ServiceWorker.',
        experimental: true
      },
          { type: 'number', description: 'Started sending request.' },
          { type: 'number', description: 'Finished sending request.' },
      {
        type: 'number',
        description: 'Time the server started pushing request.',
        experimental: true
      },
      {
        type: 'number',
        description: 'Time the server finished pushing request.',
        experimental: true
      },
      {
        type: 'number',
        description: 'Finished receiving response headers.'
      } ]
    },
    {
      id: 'ResourcePriority',
      type: 'string',
      enum: [ 'VeryLow', 'Low', 'Medium', 'High', 'VeryHigh' ],
      description: 'Loading priority of a resource request.'
    },
    {
      id: 'Request',
      type: 'object',
      description: 'HTTP request data.',
      properties: [ { type: 'string', description: 'Request URL.' },
          { type: 'string', description: 'HTTP request method.' },
          { '$ref': 'Headers', description: 'HTTP request headers.' },
        {
          type: 'string',
          optional: true,
          description: 'HTTP POST request data.'
        },
        {
          optional: true,
          type: 'string',
          enum: [ 'blockable', 'optionally-blockable', 'none' ],
          description: 'The mixed content status of the request, as defined in http://www.w3.org/TR/mixed-content/'
        },
        {
          '$ref': 'ResourcePriority',
          description: 'Priority of the resource request at the time request is sent.'
        },
        {
          type: 'string',
          enum: [ 'unsafe-url',
            'no-referrer-when-downgrade',
            'no-referrer',
            'origin',
            'origin-when-cross-origin',
            'no-referrer-when-downgrade-origin-when-cross-origin' ],
          description: 'The referrer policy of the request, as defined in https://www.w3.org/TR/referrer-policy/'
        },
        {
          type: 'boolean',
          optional: true,
          description: 'Whether is loaded via link preload.'
        } ]
    },
    {
      id: 'SignedCertificateTimestamp',
      type: 'object',
      description: 'Details of a signed certificate timestamp (SCT).',
      properties: [ { type: 'string', description: 'Validation status.' },
          { type: 'string', description: 'Origin.' },
          { type: 'string', description: 'Log name / description.' },
          { type: 'string', description: 'Log ID.' },
          { '$ref': 'Timestamp', description: 'Issuance date.' },
          { type: 'string', description: 'Hash algorithm.' },
          { type: 'string', description: 'Signature algorithm.' },
          { type: 'string', description: 'Signature data.' } ]
    },
    {
      id: 'SecurityDetails',
      type: 'object',
      description: 'Security details about a request.',
      properties: [ {
        type: 'string',
        description: 'Protocol name (e.g. "TLS 1.2" or "QUIC").'
      },
      {
        type: 'string',
        description: 'Key Exchange used by the connection, or the empty string if not applicable.'
      },
      {
        type: 'string',
        optional: true,
        description: '(EC)DH group used by the connection, if applicable.'
      },
          { type: 'string', description: 'Cipher name.' },
      {
        type: 'string',
        optional: true,
        description: 'TLS MAC. Note that AEAD ciphers do not have separate MACs.'
      },
      {
        '$ref': 'Security.CertificateId',
        description: 'Certificate ID value.'
      },
          { type: 'string', description: 'Certificate subject name.' },
      {
        type: 'array',
        items: { type: 'string' },
        description: 'Subject Alternative Name (SAN) DNS names and IP addresses.'
      },
          { type: 'string', description: 'Name of the issuing CA.' },
      {
        '$ref': 'Timestamp',
        description: 'Certificate valid from date.'
      },
      {
        '$ref': 'Timestamp',
        description: 'Certificate valid to (expiration) date'
      },
      {
        type: 'array',
        items: { '$ref': 'SignedCertificateTimestamp' },
        description: 'List of signed certificate timestamps (SCTs).'
      } ]
    },
    {
      id: 'BlockedReason',
      type: 'string',
      description: 'The reason why request was blocked.',
      enum: [ 'csp',
        'mixed-content',
        'origin',
        'inspector',
        'subresource-filter',
        'other' ],
      experimental: true
    },
    {
      id: 'Response',
      type: 'object',
      description: 'HTTP response data.',
      properties: [ {
        type: 'string',
        description: 'Response URL. This URL can be different from CachedResource.url in case of redirect.'
      },
          { type: 'number', description: 'HTTP response status code.' },
          { type: 'string', description: 'HTTP response status text.' },
          { '$ref': 'Headers', description: 'HTTP response headers.' },
      {
        type: 'string',
        optional: true,
        description: 'HTTP response headers text.'
      },
      {
        type: 'string',
        description: 'Resource mimeType as determined by the browser.'
      },
      {
        '$ref': 'Headers',
        optional: true,
        description: 'Refined HTTP request headers that were actually transmitted over the network.'
      },
      {
        type: 'string',
        optional: true,
        description: 'HTTP request headers text.'
      },
      {
        type: 'boolean',
        description: 'Specifies whether physical connection was actually reused for this request.'
      },
      {
        type: 'number',
        description: 'Physical connection id that was actually used for this request.'
      },
      {
        type: 'string',
        optional: true,
        experimental: true,
        description: 'Remote IP address.'
      },
      {
        type: 'integer',
        optional: true,
        experimental: true,
        description: 'Remote port.'
      },
      {
        type: 'boolean',
        optional: true,
        description: 'Specifies that the request was served from the disk cache.'
      },
      {
        type: 'boolean',
        optional: true,
        description: 'Specifies that the request was served from the ServiceWorker.'
      },
      {
        type: 'number',
        optional: false,
        description: 'Total number of bytes received for this request so far.'
      },
      {
        '$ref': 'ResourceTiming',
        optional: true,
        description: 'Timing information for the given request.'
      },
      {
        type: 'string',
        optional: true,
        description: 'Protocol used to fetch this request.'
      },
      {
        '$ref': 'Security.SecurityState',
        description: 'Security state of the request resource.'
      },
      {
        '$ref': 'SecurityDetails',
        optional: true,
        description: 'Security details for the request.'
      } ]
    },
    {
      id: 'WebSocketRequest',
      type: 'object',
      description: 'WebSocket request data.',
      experimental: true,
      properties: [ { '$ref': 'Headers', description: 'HTTP request headers.' } ]
    },
    {
      id: 'WebSocketResponse',
      type: 'object',
      description: 'WebSocket response data.',
      experimental: true,
      properties: [ { type: 'number', description: 'HTTP response status code.' },
          { type: 'string', description: 'HTTP response status text.' },
          { '$ref': 'Headers', description: 'HTTP response headers.' },
        {
          type: 'string',
          optional: true,
          description: 'HTTP response headers text.'
        },
        {
          '$ref': 'Headers',
          optional: true,
          description: 'HTTP request headers.'
        },
        {
          type: 'string',
          optional: true,
          description: 'HTTP request headers text.'
        } ]
    },
    {
      id: 'WebSocketFrame',
      type: 'object',
      description: 'WebSocket frame data.',
      experimental: true,
      properties: [ { type: 'number', description: 'WebSocket frame opcode.' },
          { type: 'boolean', description: 'WebSocke frame mask.' },
          { type: 'string', description: 'WebSocke frame payload data.' } ]
    },
    {
      id: 'CachedResource',
      type: 'object',
      description: 'Information about the cached resource.',
      properties: [ {
        type: 'string',
        description: 'Resource URL. This is the url of the original network request.'
      },
      {
        '$ref': 'Page.ResourceType',
        description: 'Type of this resource.'
      },
      {
        '$ref': 'Response',
        optional: true,
        description: 'Cached response data.'
      },
          { type: 'number', description: 'Cached response body size.' } ]
    },
    {
      id: 'Initiator',
      type: 'object',
      description: 'Information about the request initiator.',
      properties: [ {
        type: 'string',
        enum: [ 'parser', 'script', 'preload', 'other' ],
        description: 'Type of this initiator.'
      },
      {
        '$ref': 'Runtime.StackTrace',
        optional: true,
        description: 'Initiator JavaScript stack trace, set for Script only.'
      },
      {
        type: 'string',
        optional: true,
        description: 'Initiator URL, set for Parser type only.'
      },
      {
        type: 'number',
        optional: true,
        description: 'Initiator line number, set for Parser type only (0-based).'
      } ]
    },
    {
      id: 'Cookie',
      type: 'object',
      description: 'Cookie object',
      properties: [ { type: 'string', description: 'Cookie name.' },
          { type: 'string', description: 'Cookie value.' },
          { type: 'string', description: 'Cookie domain.' },
          { type: 'string', description: 'Cookie path.' },
        {
          type: 'number',
          description: 'Cookie expiration date as the number of seconds since the UNIX epoch.'
        },
          { type: 'integer', description: 'Cookie size.' },
          { type: 'boolean', description: 'True if cookie is http-only.' },
          { type: 'boolean', description: 'True if cookie is secure.' },
        {
          type: 'boolean',
          description: 'True in case of session cookie.'
        },
        {
          '$ref': 'CookieSameSite',
          optional: true,
          description: 'Cookie SameSite type.'
        } ],
      experimental: true
    } ],
    commands: [ {
      name: 'enable',
      description: 'Enables network tracking, network events will now be delivered to the client.',
      parameters: [ {
        type: 'integer',
        optional: true,
        experimental: true,
        description: 'Buffer size in bytes to use when preserving network payloads (XHRs, etc).'
      },
      {
        type: 'integer',
        optional: true,
        experimental: true,
        description: 'Per-resource buffer size in bytes to use when preserving network payloads (XHRs, etc).'
      } ]
    },
    {
      name: 'disable',
      description: 'Disables network tracking, prevents network events from being sent to the client.'
    },
    {
      name: 'setUserAgentOverride',
      description: 'Allows overriding user agent with the given string.',
      parameters: [ { type: 'string', description: 'User agent to use.' } ]
    },
    {
      name: 'setExtraHTTPHeaders',
      description: 'Specifies whether to always send extra HTTP headers with the requests from this page.',
      parameters: [ {
        '$ref': 'Headers',
        description: 'Map with extra HTTP headers.'
      } ]
    },
    {
      name: 'getResponseBody',
      description: 'Returns content served for the given request.',
      parameters: [ {
        '$ref': 'RequestId',
        description: 'Identifier of the network request to get content for.'
      } ],
      returns: [ { name: 'body', type: 'string', description: 'Response body.' },
        {
          name: 'base64Encoded',
          type: 'boolean',
          description: 'True, if content was sent as base64.'
        } ]
    },
    {
      name: 'setBlockedURLs',
      description: 'Blocks URLs from loading.',
      parameters: [ {
        type: 'array',
        items: { type: 'string' },
        description: 'URL patterns to block. Wildcards (\'*\') are allowed.'
      } ],
      experimental: true
    },
    {
      name: 'replayXHR',
      description: 'This method sends a new XMLHttpRequest which is identical to the original one. The following parameters should be identical: method, url, async, request body, extra headers, withCredentials attribute, user, password.',
      parameters: [ {
        '$ref': 'RequestId',
        description: 'Identifier of XHR to replay.'
      } ],
      experimental: true
    },
    {
      name: 'canClearBrowserCache',
      description: 'Tells whether clearing browser cache is supported.',
      returns: [ {
        name: 'result',
        type: 'boolean',
        description: 'True if browser cache can be cleared.'
      } ]
    },
    {
      name: 'clearBrowserCache',
      description: 'Clears browser cache.'
    },
    {
      name: 'canClearBrowserCookies',
      description: 'Tells whether clearing browser cookies is supported.',
      returns: [ {
        name: 'result',
        type: 'boolean',
        description: 'True if browser cookies can be cleared.'
      } ]
    },
    {
      name: 'clearBrowserCookies',
      description: 'Clears browser cookies.'
    },
    {
      name: 'getCookies',
      parameters: [ {
        type: 'array',
        items: { type: 'string' },
        optional: true,
        description: 'The list of URLs for which applicable cookies will be fetched'
      } ],
      returns: [ {
        name: 'cookies',
        type: 'array',
        items: { '$ref': 'Cookie' },
        description: 'Array of cookie objects.'
      } ],
      description: 'Returns all browser cookies for the current URL. Depending on the backend support, will return detailed cookie information in the <code>cookies</code> field.',
      experimental: true
    },
    {
      name: 'getAllCookies',
      returns: [ {
        name: 'cookies',
        type: 'array',
        items: { '$ref': 'Cookie' },
        description: 'Array of cookie objects.'
      } ],
      description: 'Returns all browser cookies. Depending on the backend support, will return detailed cookie information in the <code>cookies</code> field.',
      experimental: true
    },
    {
      name: 'deleteCookie',
      parameters: [ { type: 'string', description: 'Name of the cookie to remove.' },
        {
          type: 'string',
          description: 'URL to match cooke domain and path.'
        } ],
      description: 'Deletes browser cookie with given name, domain and path.',
      experimental: true
    },
    {
      name: 'setCookie',
      parameters: [ {
        type: 'string',
        description: 'The request-URI to associate with the setting of the cookie. This value can affect the default domain and path values of the created cookie.'
      },
          { type: 'string', description: 'The name of the cookie.' },
          { type: 'string', description: 'The value of the cookie.' },
      {
        type: 'string',
        optional: true,
        description: 'If omitted, the cookie becomes a host-only cookie.'
      },
      {
        type: 'string',
        optional: true,
        description: 'Defaults to the path portion of the url parameter.'
      },
      {
        type: 'boolean',
        optional: true,
        description: 'Defaults ot false.'
      },
      {
        type: 'boolean',
        optional: true,
        description: 'Defaults to false.'
      },
      {
        '$ref': 'CookieSameSite',
        optional: true,
        description: 'Defaults to browser default behavior.'
      },
      {
        '$ref': 'Timestamp',
        optional: true,
        description: 'If omitted, the cookie becomes a session cookie.'
      } ],
      returns: [ {
        name: 'success',
        type: 'boolean',
        description: 'True if successfully set cookie.'
      } ],
      description: 'Sets a cookie with the given cookie data; may overwrite equivalent cookies if they exist.',
      experimental: true
    },
    {
      name: 'canEmulateNetworkConditions',
      description: 'Tells whether emulation of network conditions is supported.',
      returns: [ {
        name: 'result',
        type: 'boolean',
        description: 'True if emulation of network conditions is supported.'
      } ],
      experimental: true
    },
    {
      name: 'emulateNetworkConditions',
      description: 'Activates emulation of network conditions.',
      parameters: [ {
        type: 'boolean',
        description: 'True to emulate internet disconnection.'
      },
          { type: 'number', description: 'Additional latency (ms).' },
      {
        type: 'number',
        description: 'Maximal aggregated download throughput.'
      },
      {
        type: 'number',
        description: 'Maximal aggregated upload throughput.'
      },
      {
        '$ref': 'ConnectionType',
        optional: true,
        description: 'Connection type if known.'
      } ]
    },
    {
      name: 'setCacheDisabled',
      parameters: [ { type: 'boolean', description: 'Cache disabled state.' } ],
      description: 'Toggles ignoring cache for each request. If <code>true</code>, cache will not be used.'
    },
    {
      name: 'setBypassServiceWorker',
      parameters: [ {
        type: 'boolean',
        description: 'Bypass service worker and load from network.'
      } ],
      experimental: true,
      description: 'Toggles ignoring of service worker for each request.'
    },
    {
      name: 'setDataSizeLimitsForTest',
      parameters: [ { type: 'integer', description: 'Maximum total buffer size.' },
          { type: 'integer', description: 'Maximum per-resource size.' } ],
      description: 'For testing.',
      experimental: true
    },
    {
      name: 'getCertificate',
      description: 'Returns the DER-encoded certificate.',
      parameters: [ {
        type: 'string',
        description: 'Origin to get certificate for.'
      } ],
      returns: [ { name: 'tableNames', type: 'array', items: { type: 'string' } } ],
      experimental: true
    } ],
    events: [ {
      name: 'resourceChangedPriority',
      description: 'Fired when resource loading priority is changed',
      parameters: [ { '$ref': 'RequestId', description: 'Request identifier.' },
        { '$ref': 'ResourcePriority', description: 'New priority' },
        { '$ref': 'Timestamp', description: 'Timestamp.' } ],
      experimental: true
    },
    {
      name: 'requestWillBeSent',
      description: 'Fired when page is about to send HTTP request.',
      parameters: [ { '$ref': 'RequestId', description: 'Request identifier.' },
        {
          '$ref': 'Page.FrameId',
          description: 'Frame identifier.',
          experimental: true
        },
          { '$ref': 'LoaderId', description: 'Loader identifier.' },
        {
          type: 'string',
          description: 'URL of the document this request is loaded for.'
        },
          { '$ref': 'Request', description: 'Request data.' },
          { '$ref': 'Timestamp', description: 'Timestamp.' },
        {
          '$ref': 'Timestamp',
          experimental: true,
          description: 'UTC Timestamp.'
        },
          { '$ref': 'Initiator', description: 'Request initiator.' },
        {
          optional: true,
          '$ref': 'Response',
          description: 'Redirect response data.'
        },
        {
          '$ref': 'Page.ResourceType',
          optional: true,
          experimental: true,
          description: 'Type of this resource.'
        } ]
    },
    {
      name: 'requestServedFromCache',
      description: 'Fired if request ended up loading from cache.',
      parameters: [ { '$ref': 'RequestId', description: 'Request identifier.' } ]
    },
    {
      name: 'responseReceived',
      description: 'Fired when HTTP response is available.',
      parameters: [ { '$ref': 'RequestId', description: 'Request identifier.' },
        {
          '$ref': 'Page.FrameId',
          description: 'Frame identifier.',
          experimental: true
        },
          { '$ref': 'LoaderId', description: 'Loader identifier.' },
          { '$ref': 'Timestamp', description: 'Timestamp.' },
          { '$ref': 'Page.ResourceType', description: 'Resource type.' },
          { '$ref': 'Response', description: 'Response data.' } ]
    },
    {
      name: 'dataReceived',
      description: 'Fired when data chunk was received over the network.',
      parameters: [ { '$ref': 'RequestId', description: 'Request identifier.' },
          { '$ref': 'Timestamp', description: 'Timestamp.' },
          { type: 'integer', description: 'Data chunk length.' },
        {
          type: 'integer',
          description: 'Actual bytes received (might be less than dataLength for compressed encodings).'
        } ]
    },
    {
      name: 'loadingFinished',
      description: 'Fired when HTTP request has finished loading.',
      parameters: [ { '$ref': 'RequestId', description: 'Request identifier.' },
          { '$ref': 'Timestamp', description: 'Timestamp.' },
        {
          type: 'number',
          description: 'Total number of bytes received for this request.'
        } ]
    },
    {
      name: 'loadingFailed',
      description: 'Fired when HTTP request has failed to load.',
      parameters: [ { '$ref': 'RequestId', description: 'Request identifier.' },
          { '$ref': 'Timestamp', description: 'Timestamp.' },
          { '$ref': 'Page.ResourceType', description: 'Resource type.' },
          { type: 'string', description: 'User friendly error message.' },
        {
          type: 'boolean',
          optional: true,
          description: 'True if loading was canceled.'
        },
        {
          '$ref': 'BlockedReason',
          optional: true,
          description: 'The reason why loading was blocked, if any.',
          experimental: true
        } ]
    },
    {
      name: 'webSocketWillSendHandshakeRequest',
      description: 'Fired when WebSocket is about to initiate handshake.',
      parameters: [ { '$ref': 'RequestId', description: 'Request identifier.' },
          { '$ref': 'Timestamp', description: 'Timestamp.' },
        {
          '$ref': 'Timestamp',
          experimental: true,
          description: 'UTC Timestamp.'
        },
        {
          '$ref': 'WebSocketRequest',
          description: 'WebSocket request data.'
        } ],
      experimental: true
    },
    {
      name: 'webSocketHandshakeResponseReceived',
      description: 'Fired when WebSocket handshake response becomes available.',
      parameters: [ { '$ref': 'RequestId', description: 'Request identifier.' },
          { '$ref': 'Timestamp', description: 'Timestamp.' },
        {
          '$ref': 'WebSocketResponse',
          description: 'WebSocket response data.'
        } ],
      experimental: true
    },
    {
      name: 'webSocketCreated',
      description: 'Fired upon WebSocket creation.',
      parameters: [ { '$ref': 'RequestId', description: 'Request identifier.' },
          { type: 'string', description: 'WebSocket request URL.' },
        {
          '$ref': 'Initiator',
          optional: true,
          description: 'Request initiator.'
        } ],
      experimental: true
    },
    {
      name: 'webSocketClosed',
      description: 'Fired when WebSocket is closed.',
      parameters: [ { '$ref': 'RequestId', description: 'Request identifier.' },
          { '$ref': 'Timestamp', description: 'Timestamp.' } ],
      experimental: true
    },
    {
      name: 'webSocketFrameReceived',
      description: 'Fired when WebSocket frame is received.',
      parameters: [ { '$ref': 'RequestId', description: 'Request identifier.' },
          { '$ref': 'Timestamp', description: 'Timestamp.' },
        {
          '$ref': 'WebSocketFrame',
          description: 'WebSocket response data.'
        } ],
      experimental: true
    },
    {
      name: 'webSocketFrameError',
      description: 'Fired when WebSocket frame error occurs.',
      parameters: [ { '$ref': 'RequestId', description: 'Request identifier.' },
          { '$ref': 'Timestamp', description: 'Timestamp.' },
        {
          type: 'string',
          description: 'WebSocket frame error message.'
        } ],
      experimental: true
    },
    {
      name: 'webSocketFrameSent',
      description: 'Fired when WebSocket frame is sent.',
      parameters: [ { '$ref': 'RequestId', description: 'Request identifier.' },
          { '$ref': 'Timestamp', description: 'Timestamp.' },
        {
          '$ref': 'WebSocketFrame',
          description: 'WebSocket response data.'
        } ],
      experimental: true
    },
    {
      name: 'eventSourceMessageReceived',
      description: 'Fired when EventSource message is received.',
      parameters: [ { '$ref': 'RequestId', description: 'Request identifier.' },
          { '$ref': 'Timestamp', description: 'Timestamp.' },
          { type: 'string', description: 'Message type.' },
          { type: 'string', description: 'Message identifier.' },
          { type: 'string', description: 'Message content.' } ],
      experimental: true
    } ]
  },
  Database: {
    domain: 'Database',
    experimental: true,
    types: [ {
      id: 'DatabaseId',
      type: 'string',
      description: 'Unique identifier of Database object.',
      experimental: true
    },
    {
      id: 'Database',
      type: 'object',
      description: 'Database object.',
      experimental: true,
      properties: [ { '$ref': 'DatabaseId', description: 'Database ID.' },
          { type: 'string', description: 'Database domain.' },
          { type: 'string', description: 'Database name.' },
          { type: 'string', description: 'Database version.' } ]
    },
    {
      id: 'Error',
      type: 'object',
      description: 'Database error.',
      properties: [ { type: 'string', description: 'Error message.' },
          { type: 'integer', description: 'Error code.' } ]
    } ],
    commands: [ {
      name: 'enable',
      description: 'Enables database tracking, database events will now be delivered to the client.'
    },
    {
      name: 'disable',
      description: 'Disables database tracking, prevents database events from being sent to the client.'
    },
    {
      name: 'getDatabaseTableNames',
      parameters: [ { '$ref': 'DatabaseId' } ],
      returns: [ { name: 'tableNames', type: 'array', items: { type: 'string' } } ]
    },
    {
      name: 'executeSQL',
      parameters: [ { '$ref': 'DatabaseId' }, { type: 'string' } ],
      returns: [ {
        name: 'columnNames',
        type: 'array',
        optional: true,
        items: { type: 'string' }
      },
      {
        name: 'values',
        type: 'array',
        optional: true,
        items: { type: 'any' }
      },
          { name: 'sqlError', '$ref': 'Error', optional: true } ]
    } ],
    events: [ { name: 'addDatabase', parameters: [ { '$ref': 'Database' } ] } ]
  },
  IndexedDB: {
    domain: 'IndexedDB',
    dependencies: [ 'Runtime' ],
    experimental: true,
    types: [ {
      id: 'DatabaseWithObjectStores',
      type: 'object',
      description: 'Database with an array of object stores.',
      properties: [ { type: 'string', description: 'Database name.' },
        { type: 'integer', description: 'Database version.' },
        {
          type: 'array',
          items: { '$ref': 'ObjectStore' },
          description: 'Object stores in this database.'
        } ]
    },
    {
      id: 'ObjectStore',
      type: 'object',
      description: 'Object store.',
      properties: [ { type: 'string', description: 'Object store name.' },
          { '$ref': 'KeyPath', description: 'Object store key path.' },
        {
          type: 'boolean',
          description: 'If true, object store has auto increment flag set.'
        },
        {
          type: 'array',
          items: { '$ref': 'ObjectStoreIndex' },
          description: 'Indexes in this object store.'
        } ]
    },
    {
      id: 'ObjectStoreIndex',
      type: 'object',
      description: 'Object store index.',
      properties: [ { type: 'string', description: 'Index name.' },
          { '$ref': 'KeyPath', description: 'Index key path.' },
          { type: 'boolean', description: 'If true, index is unique.' },
        {
          type: 'boolean',
          description: 'If true, index allows multiple entries for a key.'
        } ]
    },
    {
      id: 'Key',
      type: 'object',
      description: 'Key.',
      properties: [ {
        type: 'string',
        enum: [ 'number', 'string', 'date', 'array' ],
        description: 'Key type.'
      },
          { type: 'number', optional: true, description: 'Number value.' },
          { type: 'string', optional: true, description: 'String value.' },
          { type: 'number', optional: true, description: 'Date value.' },
      {
        type: 'array',
        optional: true,
        items: { '$ref': 'Key' },
        description: 'Array value.'
      } ]
    },
    {
      id: 'KeyRange',
      type: 'object',
      description: 'Key range.',
      properties: [ { '$ref': 'Key', optional: true, description: 'Lower bound.' },
          { '$ref': 'Key', optional: true, description: 'Upper bound.' },
          { type: 'boolean', description: 'If true lower bound is open.' },
          { type: 'boolean', description: 'If true upper bound is open.' } ]
    },
    {
      id: 'DataEntry',
      type: 'object',
      description: 'Data entry.',
      properties: [ { '$ref': 'Runtime.RemoteObject', description: 'Key object.' },
        {
          '$ref': 'Runtime.RemoteObject',
          description: 'Primary key object.'
        },
          { '$ref': 'Runtime.RemoteObject', description: 'Value object.' } ]
    },
    {
      id: 'KeyPath',
      type: 'object',
      description: 'Key path.',
      properties: [ {
        type: 'string',
        enum: [ 'null', 'string', 'array' ],
        description: 'Key path type.'
      },
          { type: 'string', optional: true, description: 'String value.' },
      {
        type: 'array',
        optional: true,
        items: { type: 'string' },
        description: 'Array value.'
      } ]
    } ],
    commands: [ { name: 'enable', description: 'Enables events from backend.' },
      {
        name: 'disable',
        description: 'Disables events from backend.'
      },
      {
        name: 'requestDatabaseNames',
        parameters: [ { type: 'string', description: 'Security origin.' } ],
        returns: [ {
          name: 'databaseNames',
          type: 'array',
          items: { type: 'string' },
          description: 'Database names for origin.'
        } ],
        description: 'Requests database names for given security origin.'
      },
      {
        name: 'requestDatabase',
        parameters: [ { type: 'string', description: 'Security origin.' },
          { type: 'string', description: 'Database name.' } ],
        returns: [ {
          name: 'databaseWithObjectStores',
          '$ref': 'DatabaseWithObjectStores',
          description: 'Database with an array of object stores.'
        } ],
        description: 'Requests database with given name in given frame.'
      },
      {
        name: 'requestData',
        parameters: [ { type: 'string', description: 'Security origin.' },
          { type: 'string', description: 'Database name.' },
          { type: 'string', description: 'Object store name.' },
          {
            type: 'string',
            description: 'Index name, empty string for object store data requests.'
          },
          { type: 'integer', description: 'Number of records to skip.' },
          { type: 'integer', description: 'Number of records to fetch.' },
          { '$ref': 'KeyRange', optional: true, description: 'Key range.' } ],
        returns: [ {
          name: 'objectStoreDataEntries',
          type: 'array',
          items: { '$ref': 'DataEntry' },
          description: 'Array of object store data entries.'
        },
        {
          name: 'hasMore',
          type: 'boolean',
          description: 'If true, there are more entries to fetch in the given range.'
        } ],
        description: 'Requests data from object store or index.'
      },
      {
        name: 'clearObjectStore',
        parameters: [ { type: 'string', description: 'Security origin.' },
          { type: 'string', description: 'Database name.' },
          { type: 'string', description: 'Object store name.' } ],
        returns: [],
        description: 'Clears all entries from an object store.'
      },
      {
        name: 'deleteDatabase',
        parameters: [ { type: 'string', description: 'Security origin.' },
          { type: 'string', description: 'Database name.' } ],
        returns: [],
        description: 'Deletes a database.'
      } ]
  },
  CacheStorage: {
    domain: 'CacheStorage',
    experimental: true,
    types: [ {
      id: 'CacheId',
      type: 'string',
      description: 'Unique identifier of the Cache object.'
    },
    {
      id: 'DataEntry',
      type: 'object',
      description: 'Data entry.',
      properties: [ { type: 'string', description: 'Request url spec.' },
          { type: 'string', description: 'Response stataus text.' } ]
    },
    {
      id: 'Cache',
      type: 'object',
      description: 'Cache identifier.',
      properties: [ {
        '$ref': 'CacheId',
        description: 'An opaque unique id of the cache.'
      },
          { type: 'string', description: 'Security origin of the cache.' },
          { type: 'string', description: 'The name of the cache.' } ]
    } ],
    commands: [ {
      name: 'requestCacheNames',
      parameters: [ { type: 'string', description: 'Security origin.' } ],
      returns: [ {
        name: 'caches',
        type: 'array',
        items: { '$ref': 'Cache' },
        description: 'Caches for the security origin.'
      } ],
      description: 'Requests cache names.'
    },
    {
      name: 'requestEntries',
      parameters: [ {
        '$ref': 'CacheId',
        description: 'ID of cache to get entries from.'
      },
          { type: 'integer', description: 'Number of records to skip.' },
          { type: 'integer', description: 'Number of records to fetch.' } ],
      returns: [ {
        name: 'cacheDataEntries',
        type: 'array',
        items: { '$ref': 'DataEntry' },
        description: 'Array of object store data entries.'
      },
      {
        name: 'hasMore',
        type: 'boolean',
        description: 'If true, there are more entries to fetch in the given range.'
      } ],
      description: 'Requests data from cache.'
    },
    {
      name: 'deleteCache',
      parameters: [ { '$ref': 'CacheId', description: 'Id of cache for deletion.' } ],
      description: 'Deletes a cache.'
    },
    {
      name: 'deleteEntry',
      parameters: [ {
        '$ref': 'CacheId',
        description: 'Id of cache where the entry will be deleted.'
      },
          { type: 'string', description: 'URL spec of the request.' } ],
      description: 'Deletes a cache entry.'
    } ]
  },
  DOMStorage: {
    domain: 'DOMStorage',
    experimental: true,
    description: 'Query and modify DOM storage.',
    types: [ {
      id: 'StorageId',
      type: 'object',
      description: 'DOM Storage identifier.',
      experimental: true,
      properties: [ {
        type: 'string',
        description: 'Security origin for the storage.'
      },
      {
        type: 'boolean',
        description: 'Whether the storage is local storage (not session storage).'
      } ]
    },
    {
      id: 'Item',
      type: 'array',
      description: 'DOM Storage item.',
      experimental: true,
      items: { type: 'string' }
    } ],
    commands: [ {
      name: 'enable',
      description: 'Enables storage tracking, storage events will now be delivered to the client.'
    },
    {
      name: 'disable',
      description: 'Disables storage tracking, prevents storage events from being sent to the client.'
    },
      { name: 'clear', parameters: [ { '$ref': 'StorageId' } ] },
    {
      name: 'getDOMStorageItems',
      parameters: [ { '$ref': 'StorageId' } ],
      returns: [ { name: 'entries', type: 'array', items: { '$ref': 'Item' } } ]
    },
    {
      name: 'setDOMStorageItem',
      parameters: [ { '$ref': 'StorageId' },
          { type: 'string' },
          { type: 'string' } ]
    },
    {
      name: 'removeDOMStorageItem',
      parameters: [ { '$ref': 'StorageId' }, { type: 'string' } ]
    } ],
    events: [ {
      name: 'domStorageItemsCleared',
      parameters: [ { '$ref': 'StorageId' } ]
    },
    {
      name: 'domStorageItemRemoved',
      parameters: [ { '$ref': 'StorageId' }, { type: 'string' } ]
    },
    {
      name: 'domStorageItemAdded',
      parameters: [ { '$ref': 'StorageId' },
          { type: 'string' },
          { type: 'string' } ]
    },
    {
      name: 'domStorageItemUpdated',
      parameters: [ { '$ref': 'StorageId' },
          { type: 'string' },
          { type: 'string' },
          { type: 'string' } ]
    } ]
  },
  ApplicationCache: {
    domain: 'ApplicationCache',
    experimental: true,
    types: [ {
      id: 'ApplicationCacheResource',
      type: 'object',
      description: 'Detailed application cache resource information.',
      properties: [ { type: 'string', description: 'Resource url.' },
        { type: 'integer', description: 'Resource size.' },
        { type: 'string', description: 'Resource type.' } ]
    },
    {
      id: 'ApplicationCache',
      type: 'object',
      description: 'Detailed application cache information.',
      properties: [ { type: 'string', description: 'Manifest URL.' },
          { type: 'number', description: 'Application cache size.' },
        {
          type: 'number',
          description: 'Application cache creation time.'
        },
        {
          type: 'number',
          description: 'Application cache update time.'
        },
        {
          type: 'array',
          items: { '$ref': 'ApplicationCacheResource' },
          description: 'Application cache resources.'
        } ]
    },
    {
      id: 'FrameWithManifest',
      type: 'object',
      description: 'Frame identifier - manifest URL pair.',
      properties: [ { '$ref': 'Page.FrameId', description: 'Frame identifier.' },
          { type: 'string', description: 'Manifest URL.' },
          { type: 'integer', description: 'Application cache status.' } ]
    } ],
    commands: [ {
      name: 'getFramesWithManifests',
      returns: [ {
        name: 'frameIds',
        type: 'array',
        items: { '$ref': 'FrameWithManifest' },
        description: 'Array of frame identifiers with manifest urls for each frame containing a document associated with some application cache.'
      } ],
      description: 'Returns array of frame identifiers with manifest urls for each frame containing a document associated with some application cache.'
    },
    {
      name: 'enable',
      description: 'Enables application cache domain notifications.'
    },
    {
      name: 'getManifestForFrame',
      parameters: [ {
        '$ref': 'Page.FrameId',
        description: 'Identifier of the frame containing document whose manifest is retrieved.'
      } ],
      returns: [ {
        name: 'manifestURL',
        type: 'string',
        description: 'Manifest URL for document in the given frame.'
      } ],
      description: 'Returns manifest URL for document in the given frame.'
    },
    {
      name: 'getApplicationCacheForFrame',
      parameters: [ {
        '$ref': 'Page.FrameId',
        description: 'Identifier of the frame containing document whose application cache is retrieved.'
      } ],
      returns: [ {
        name: 'applicationCache',
        '$ref': 'ApplicationCache',
        description: 'Relevant application cache data for the document in given frame.'
      } ],
      description: 'Returns relevant application cache data for the document in given frame.'
    } ],
    events: [ {
      name: 'applicationCacheStatusUpdated',
      parameters: [ {
        '$ref': 'Page.FrameId',
        description: 'Identifier of the frame containing document whose application cache updated status.'
      },
        { type: 'string', description: 'Manifest URL.' },
      {
        type: 'integer',
        description: 'Updated application cache status.'
      } ]
    },
    {
      name: 'networkStateUpdated',
      parameters: [ { type: 'boolean' } ]
    } ]
  },
  DOM: {
    domain: 'DOM',
    description: 'This domain exposes DOM read/write operations. Each DOM Node is represented with its mirror object that has an <code>id</code>. This <code>id</code> can be used to get additional information on the Node, resolve it into the JavaScript object wrapper, etc. It is important that client receives DOM events only for the nodes that are known to the client. Backend keeps track of the nodes that were sent to the client and never sends the same node twice. It is client\'s responsibility to collect information about the nodes that were sent to the client.<p>Note that <code>iframe</code> owner elements will return corresponding document elements as their child nodes.</p>',
    dependencies: [ 'Runtime' ],
    types: [ {
      id: 'NodeId',
      type: 'integer',
      description: 'Unique DOM node identifier.'
    },
    {
      id: 'BackendNodeId',
      type: 'integer',
      description: 'Unique DOM node identifier used to reference a node that may not have been pushed to the front-end.',
      experimental: true
    },
    {
      id: 'BackendNode',
      type: 'object',
      properties: [ {
        type: 'integer',
        description: '<code>Node</code>\'s nodeType.'
      },
      {
        type: 'string',
        description: '<code>Node</code>\'s nodeName.'
      },
          { '$ref': 'BackendNodeId' } ],
      experimental: true,
      description: 'Backend node with a friendly name.'
    },
    {
      id: 'PseudoType',
      type: 'string',
      enum: [ 'first-line',
        'first-letter',
        'before',
        'after',
        'backdrop',
        'selection',
        'first-line-inherited',
        'scrollbar',
        'scrollbar-thumb',
        'scrollbar-button',
        'scrollbar-track',
        'scrollbar-track-piece',
        'scrollbar-corner',
        'resizer',
        'input-list-button' ],
      description: 'Pseudo element type.'
    },
    {
      id: 'ShadowRootType',
      type: 'string',
      enum: [ 'user-agent', 'open', 'closed' ],
      description: 'Shadow root type.'
    },
    {
      id: 'Node',
      type: 'object',
      properties: [ {
        '$ref': 'NodeId',
        description: 'Node identifier that is passed into the rest of the DOM messages as the <code>nodeId</code>. Backend will only push node with given <code>id</code> once. It is aware of all requested nodes and will only fire DOM events for nodes known to the client.'
      },
      {
        '$ref': 'NodeId',
        optional: true,
        description: 'The id of the parent node if any.',
        experimental: true
      },
      {
        '$ref': 'BackendNodeId',
        description: 'The BackendNodeId for this node.',
        experimental: true
      },
      {
        type: 'integer',
        description: '<code>Node</code>\'s nodeType.'
      },
      {
        type: 'string',
        description: '<code>Node</code>\'s nodeName.'
      },
      {
        type: 'string',
        description: '<code>Node</code>\'s localName.'
      },
      {
        type: 'string',
        description: '<code>Node</code>\'s nodeValue.'
      },
      {
        type: 'integer',
        optional: true,
        description: 'Child count for <code>Container</code> nodes.'
      },
      {
        type: 'array',
        optional: true,
        items: { '$ref': 'Node' },
        description: 'Child nodes of this node when requested with children.'
      },
      {
        type: 'array',
        optional: true,
        items: { type: 'string' },
        description: 'Attributes of the <code>Element</code> node in the form of flat array <code>[name1, value1, name2, value2]</code>.'
      },
      {
        type: 'string',
        optional: true,
        description: 'Document URL that <code>Document</code> or <code>FrameOwner</code> node points to.'
      },
      {
        type: 'string',
        optional: true,
        description: 'Base URL that <code>Document</code> or <code>FrameOwner</code> node uses for URL completion.',
        experimental: true
      },
      {
        type: 'string',
        optional: true,
        description: '<code>DocumentType</code>\'s publicId.'
      },
      {
        type: 'string',
        optional: true,
        description: '<code>DocumentType</code>\'s systemId.'
      },
      {
        type: 'string',
        optional: true,
        description: '<code>DocumentType</code>\'s internalSubset.'
      },
      {
        type: 'string',
        optional: true,
        description: '<code>Document</code>\'s XML version in case of XML documents.'
      },
      {
        type: 'string',
        optional: true,
        description: '<code>Attr</code>\'s name.'
      },
      {
        type: 'string',
        optional: true,
        description: '<code>Attr</code>\'s value.'
      },
      {
        '$ref': 'PseudoType',
        optional: true,
        description: 'Pseudo element type for this node.'
      },
      {
        '$ref': 'ShadowRootType',
        optional: true,
        description: 'Shadow root type.'
      },
      {
        '$ref': 'Page.FrameId',
        optional: true,
        description: 'Frame ID for frame owner elements.',
        experimental: true
      },
      {
        '$ref': 'Node',
        optional: true,
        description: 'Content document for frame owner elements.'
      },
      {
        type: 'array',
        optional: true,
        items: { '$ref': 'Node' },
        description: 'Shadow root list for given element host.',
        experimental: true
      },
      {
        '$ref': 'Node',
        optional: true,
        description: 'Content document fragment for template elements.',
        experimental: true
      },
      {
        type: 'array',
        items: { '$ref': 'Node' },
        optional: true,
        description: 'Pseudo elements associated with this node.',
        experimental: true
      },
      {
        '$ref': 'Node',
        optional: true,
        description: 'Import document for the HTMLImport links.'
      },
      {
        type: 'array',
        items: { '$ref': 'BackendNode' },
        optional: true,
        description: 'Distributed nodes for given insertion point.',
        experimental: true
      },
      {
        type: 'boolean',
        optional: true,
        description: 'Whether the node is SVG.',
        experimental: true
      } ],
      description: 'DOM interaction is implemented in terms of mirror objects that represent the actual DOM nodes. DOMNode is a base node mirror type.'
    },
    {
      id: 'RGBA',
      type: 'object',
      properties: [ {
        type: 'integer',
        description: 'The red component, in the [0-255] range.'
      },
      {
        type: 'integer',
        description: 'The green component, in the [0-255] range.'
      },
      {
        type: 'integer',
        description: 'The blue component, in the [0-255] range.'
      },
      {
        type: 'number',
        optional: true,
        description: 'The alpha component, in the [0-1] range (default: 1).'
      } ],
      description: 'A structure holding an RGBA color.'
    },
    {
      id: 'Quad',
      type: 'array',
      items: { type: 'number' },
      minItems: 8,
      maxItems: 8,
      description: 'An array of quad vertices, x immediately followed by y for each point, points clock-wise.',
      experimental: true
    },
    {
      id: 'BoxModel',
      type: 'object',
      experimental: true,
      properties: [ { '$ref': 'Quad', description: 'Content box' },
          { '$ref': 'Quad', description: 'Padding box' },
          { '$ref': 'Quad', description: 'Border box' },
          { '$ref': 'Quad', description: 'Margin box' },
          { type: 'integer', description: 'Node width' },
          { type: 'integer', description: 'Node height' },
        {
          '$ref': 'ShapeOutsideInfo',
          optional: true,
          description: 'Shape outside coordinates'
        } ],
      description: 'Box model.'
    },
    {
      id: 'ShapeOutsideInfo',
      type: 'object',
      experimental: true,
      properties: [ { '$ref': 'Quad', description: 'Shape bounds' },
        {
          type: 'array',
          items: { type: 'any' },
          description: 'Shape coordinate details'
        },
        {
          type: 'array',
          items: { type: 'any' },
          description: 'Margin shape bounds'
        } ],
      description: 'CSS Shape Outside details.'
    },
    {
      id: 'Rect',
      type: 'object',
      experimental: true,
      properties: [ { type: 'number', description: 'X coordinate' },
          { type: 'number', description: 'Y coordinate' },
          { type: 'number', description: 'Rectangle width' },
          { type: 'number', description: 'Rectangle height' } ],
      description: 'Rectangle.'
    },
    {
      id: 'HighlightConfig',
      type: 'object',
      properties: [ {
        type: 'boolean',
        optional: true,
        description: 'Whether the node info tooltip should be shown (default: false).'
      },
      {
        type: 'boolean',
        optional: true,
        description: 'Whether the rulers should be shown (default: false).'
      },
      {
        type: 'boolean',
        optional: true,
        description: 'Whether the extension lines from node to the rulers should be shown (default: false).'
      },
          { type: 'boolean', optional: true, experimental: true },
      {
        '$ref': 'RGBA',
        optional: true,
        description: 'The content box highlight fill color (default: transparent).'
      },
      {
        '$ref': 'RGBA',
        optional: true,
        description: 'The padding highlight fill color (default: transparent).'
      },
      {
        '$ref': 'RGBA',
        optional: true,
        description: 'The border highlight fill color (default: transparent).'
      },
      {
        '$ref': 'RGBA',
        optional: true,
        description: 'The margin highlight fill color (default: transparent).'
      },
      {
        '$ref': 'RGBA',
        optional: true,
        experimental: true,
        description: 'The event target element highlight fill color (default: transparent).'
      },
      {
        '$ref': 'RGBA',
        optional: true,
        experimental: true,
        description: 'The shape outside fill color (default: transparent).'
      },
      {
        '$ref': 'RGBA',
        optional: true,
        experimental: true,
        description: 'The shape margin fill color (default: transparent).'
      },
      {
        type: 'string',
        optional: true,
        description: 'Selectors to highlight relevant nodes.'
      } ],
      description: 'Configuration data for the highlighting of page elements.'
    },
    {
      id: 'InspectMode',
      type: 'string',
      experimental: true,
      enum: [ 'searchForNode', 'searchForUAShadowDOM', 'none' ]
    } ],
    commands: [ {
      name: 'enable',
      description: 'Enables DOM agent for the given page.'
    },
    {
      name: 'disable',
      description: 'Disables DOM agent for the given page.'
    },
    {
      name: 'getDocument',
      parameters: [ {
        type: 'integer',
        optional: true,
        description: 'The maximum depth at which children should be retrieved, defaults to 1. Use -1 for the entire subtree or provide an integer larger than 0.',
        experimental: true
      },
      {
        type: 'boolean',
        optional: true,
        description: 'Whether or not iframes and shadow roots should be traversed when returning the subtree (default is false).',
        experimental: true
      } ],
      returns: [ { name: 'root', '$ref': 'Node', description: 'Resulting node.' } ],
      description: 'Returns the root DOM node (and optionally the subtree) to the caller.'
    },
    {
      name: 'getFlattenedDocument',
      parameters: [ {
        type: 'integer',
        optional: true,
        description: 'The maximum depth at which children should be retrieved, defaults to 1. Use -1 for the entire subtree or provide an integer larger than 0.',
        experimental: true
      },
      {
        type: 'boolean',
        optional: true,
        description: 'Whether or not iframes and shadow roots should be traversed when returning the subtree (default is false).',
        experimental: true
      } ],
      returns: [ {
        name: 'nodes',
        type: 'array',
        items: { '$ref': 'Node' },
        description: 'Resulting node.'
      } ],
      description: 'Returns the root DOM node (and optionally the subtree) to the caller.'
    },
    {
      name: 'collectClassNamesFromSubtree',
      parameters: [ {
        '$ref': 'NodeId',
        description: 'Id of the node to collect class names.'
      } ],
      returns: [ {
        name: 'classNames',
        type: 'array',
        items: { type: 'string' },
        description: 'Class name list.'
      } ],
      description: 'Collects class names for the node with given id and all of it\'s child nodes.',
      experimental: true
    },
    {
      name: 'requestChildNodes',
      parameters: [ {
        '$ref': 'NodeId',
        description: 'Id of the node to get children for.'
      },
      {
        type: 'integer',
        optional: true,
        description: 'The maximum depth at which children should be retrieved, defaults to 1. Use -1 for the entire subtree or provide an integer larger than 0.',
        experimental: true
      },
      {
        type: 'boolean',
        optional: true,
        description: 'Whether or not iframes and shadow roots should be traversed when returning the sub-tree (default is false).',
        experimental: true
      } ],
      description: 'Requests that children of the node with given id are returned to the caller in form of <code>setChildNodes</code> events where not only immediate children are retrieved, but all children down to the specified depth.'
    },
    {
      name: 'querySelector',
      parameters: [ {
        '$ref': 'NodeId',
        description: 'Id of the node to query upon.'
      },
          { type: 'string', description: 'Selector string.' } ],
      returns: [ {
        name: 'nodeId',
        '$ref': 'NodeId',
        description: 'Query selector result.'
      } ],
      description: 'Executes <code>querySelector</code> on a given node.'
    },
    {
      name: 'querySelectorAll',
      parameters: [ {
        '$ref': 'NodeId',
        description: 'Id of the node to query upon.'
      },
          { type: 'string', description: 'Selector string.' } ],
      returns: [ {
        name: 'nodeIds',
        type: 'array',
        items: { '$ref': 'NodeId' },
        description: 'Query selector result.'
      } ],
      description: 'Executes <code>querySelectorAll</code> on a given node.'
    },
    {
      name: 'setNodeName',
      parameters: [ {
        '$ref': 'NodeId',
        description: 'Id of the node to set name for.'
      },
          { type: 'string', description: 'New node\'s name.' } ],
      returns: [ {
        name: 'nodeId',
        '$ref': 'NodeId',
        description: 'New node\'s id.'
      } ],
      description: 'Sets node name for a node with given id.'
    },
    {
      name: 'setNodeValue',
      parameters: [ {
        '$ref': 'NodeId',
        description: 'Id of the node to set value for.'
      },
          { type: 'string', description: 'New node\'s value.' } ],
      description: 'Sets node value for a node with given id.'
    },
    {
      name: 'removeNode',
      parameters: [ { '$ref': 'NodeId', description: 'Id of the node to remove.' } ],
      description: 'Removes node with given id.'
    },
    {
      name: 'setAttributeValue',
      parameters: [ {
        '$ref': 'NodeId',
        description: 'Id of the element to set attribute for.'
      },
          { type: 'string', description: 'Attribute name.' },
          { type: 'string', description: 'Attribute value.' } ],
      description: 'Sets attribute for an element with given id.'
    },
    {
      name: 'setAttributesAsText',
      parameters: [ {
        '$ref': 'NodeId',
        description: 'Id of the element to set attributes for.'
      },
      {
        type: 'string',
        description: 'Text with a number of attributes. Will parse this text using HTML parser.'
      },
      {
        type: 'string',
        optional: true,
        description: 'Attribute name to replace with new attributes derived from text in case text parsed successfully.'
      } ],
      description: 'Sets attributes on element with given id. This method is useful when user edits some existing attribute value and types in several attribute name/value pairs.'
    },
    {
      name: 'removeAttribute',
      parameters: [ {
        '$ref': 'NodeId',
        description: 'Id of the element to remove attribute from.'
      },
      {
        type: 'string',
        description: 'Name of the attribute to remove.'
      } ],
      description: 'Removes attribute with given name from an element with given id.'
    },
    {
      name: 'getOuterHTML',
      parameters: [ {
        '$ref': 'NodeId',
        description: 'Id of the node to get markup for.'
      } ],
      returns: [ {
        name: 'outerHTML',
        type: 'string',
        description: 'Outer HTML markup.'
      } ],
      description: 'Returns node\'s HTML markup.'
    },
    {
      name: 'setOuterHTML',
      parameters: [ {
        '$ref': 'NodeId',
        description: 'Id of the node to set markup for.'
      },
          { type: 'string', description: 'Outer HTML markup to set.' } ],
      description: 'Sets node HTML markup, returns new node id.'
    },
    {
      name: 'performSearch',
      parameters: [ {
        type: 'string',
        description: 'Plain text or query selector or XPath search query.'
      },
      {
        type: 'boolean',
        optional: true,
        description: 'True to search in user agent shadow DOM.',
        experimental: true
      } ],
      returns: [ {
        name: 'searchId',
        type: 'string',
        description: 'Unique search session identifier.'
      },
      {
        name: 'resultCount',
        type: 'integer',
        description: 'Number of search results.'
      } ],
      description: 'Searches for a given string in the DOM tree. Use <code>getSearchResults</code> to access search results or <code>cancelSearch</code> to end this search session.',
      experimental: true
    },
    {
      name: 'getSearchResults',
      parameters: [ {
        type: 'string',
        description: 'Unique search session identifier.'
      },
      {
        type: 'integer',
        description: 'Start index of the search result to be returned.'
      },
      {
        type: 'integer',
        description: 'End index of the search result to be returned.'
      } ],
      returns: [ {
        name: 'nodeIds',
        type: 'array',
        items: { '$ref': 'NodeId' },
        description: 'Ids of the search result nodes.'
      } ],
      description: 'Returns search results from given <code>fromIndex</code> to given <code>toIndex</code> from the sarch with the given identifier.',
      experimental: true
    },
    {
      name: 'discardSearchResults',
      parameters: [ {
        type: 'string',
        description: 'Unique search session identifier.'
      } ],
      description: 'Discards search results from the session with the given id. <code>getSearchResults</code> should no longer be called for that search.',
      experimental: true
    },
    {
      name: 'requestNode',
      parameters: [ {
        '$ref': 'Runtime.RemoteObjectId',
        description: 'JavaScript object id to convert into node.'
      } ],
      returns: [ {
        name: 'nodeId',
        '$ref': 'NodeId',
        description: 'Node id for given object.'
      } ],
      description: 'Requests that the node is sent to the caller given the JavaScript node object reference. All nodes that form the path from the node to the root are also sent to the client as a series of <code>setChildNodes</code> notifications.'
    },
    {
      name: 'setInspectMode',
      experimental: true,
      parameters: [ {
        '$ref': 'InspectMode',
        description: 'Set an inspection mode.'
      },
      {
        '$ref': 'HighlightConfig',
        optional: true,
        description: 'A descriptor for the highlight appearance of hovered-over nodes. May be omitted if <code>enabled == false</code>.'
      } ],
      description: 'Enters the \'inspect\' mode. In this mode, elements that user is hovering over are highlighted. Backend then generates \'inspectNodeRequested\' event upon element selection.'
    },
    {
      name: 'highlightRect',
      parameters: [ { type: 'integer', description: 'X coordinate' },
          { type: 'integer', description: 'Y coordinate' },
          { type: 'integer', description: 'Rectangle width' },
          { type: 'integer', description: 'Rectangle height' },
        {
          '$ref': 'RGBA',
          optional: true,
          description: 'The highlight fill color (default: transparent).'
        },
        {
          '$ref': 'RGBA',
          optional: true,
          description: 'The highlight outline color (default: transparent).'
        } ],
      description: 'Highlights given rectangle. Coordinates are absolute with respect to the main frame viewport.'
    },
    {
      name: 'highlightQuad',
      parameters: [ { '$ref': 'Quad', description: 'Quad to highlight' },
        {
          '$ref': 'RGBA',
          optional: true,
          description: 'The highlight fill color (default: transparent).'
        },
        {
          '$ref': 'RGBA',
          optional: true,
          description: 'The highlight outline color (default: transparent).'
        } ],
      description: 'Highlights given quad. Coordinates are absolute with respect to the main frame viewport.',
      experimental: true
    },
    {
      name: 'highlightNode',
      parameters: [ {
        '$ref': 'HighlightConfig',
        description: 'A descriptor for the highlight appearance.'
      },
      {
        '$ref': 'NodeId',
        optional: true,
        description: 'Identifier of the node to highlight.'
      },
      {
        '$ref': 'BackendNodeId',
        optional: true,
        description: 'Identifier of the backend node to highlight.'
      },
      {
        '$ref': 'Runtime.RemoteObjectId',
        optional: true,
        description: 'JavaScript object id of the node to be highlighted.',
        experimental: true
      } ],
      description: 'Highlights DOM node with given id or with the given JavaScript object wrapper. Either nodeId or objectId must be specified.'
    },
    {
      name: 'hideHighlight',
      description: 'Hides DOM node highlight.'
    },
    {
      name: 'highlightFrame',
      parameters: [ {
        '$ref': 'Page.FrameId',
        description: 'Identifier of the frame to highlight.'
      },
      {
        '$ref': 'RGBA',
        optional: true,
        description: 'The content box highlight fill color (default: transparent).'
      },
      {
        '$ref': 'RGBA',
        optional: true,
        description: 'The content box highlight outline color (default: transparent).'
      } ],
      description: 'Highlights owner element of the frame with given id.',
      experimental: true
    },
    {
      name: 'pushNodeByPathToFrontend',
      parameters: [ {
        type: 'string',
        description: 'Path to node in the proprietary format.'
      } ],
      returns: [ {
        name: 'nodeId',
        '$ref': 'NodeId',
        description: 'Id of the node for given path.'
      } ],
      description: 'Requests that the node is sent to the caller given its path. // FIXME, use XPath',
      experimental: true
    },
    {
      name: 'pushNodesByBackendIdsToFrontend',
      parameters: [ {
        type: 'array',
        items: { '$ref': 'BackendNodeId' },
        description: 'The array of backend node ids.'
      } ],
      returns: [ {
        name: 'nodeIds',
        type: 'array',
        items: { '$ref': 'NodeId' },
        description: 'The array of ids of pushed nodes that correspond to the backend ids specified in backendNodeIds.'
      } ],
      description: 'Requests that a batch of nodes is sent to the caller given their backend node ids.',
      experimental: true
    },
    {
      name: 'setInspectedNode',
      parameters: [ {
        '$ref': 'NodeId',
        description: 'DOM node id to be accessible by means of $x command line API.'
      } ],
      description: 'Enables console to refer to the node with given id via $x (see Command Line API for more details $x functions).',
      experimental: true
    },
    {
      name: 'resolveNode',
      parameters: [ { '$ref': 'NodeId', description: 'Id of the node to resolve.' },
        {
          type: 'string',
          optional: true,
          description: 'Symbolic group name that can be used to release multiple objects.'
        } ],
      returns: [ {
        name: 'object',
        '$ref': 'Runtime.RemoteObject',
        description: 'JavaScript object wrapper for given node.'
      } ],
      description: 'Resolves JavaScript node object for given node id.'
    },
    {
      name: 'getAttributes',
      parameters: [ {
        '$ref': 'NodeId',
        description: 'Id of the node to retrieve attibutes for.'
      } ],
      returns: [ {
        name: 'attributes',
        type: 'array',
        items: { type: 'string' },
        description: 'An interleaved array of node attribute names and values.'
      } ],
      description: 'Returns attributes for the specified node.'
    },
    {
      name: 'copyTo',
      parameters: [ { '$ref': 'NodeId', description: 'Id of the node to copy.' },
        {
          '$ref': 'NodeId',
          description: 'Id of the element to drop the copy into.'
        },
        {
          '$ref': 'NodeId',
          optional: true,
          description: 'Drop the copy before this node (if absent, the copy becomes the last child of <code>targetNodeId</code>).'
        } ],
      returns: [ {
        name: 'nodeId',
        '$ref': 'NodeId',
        description: 'Id of the node clone.'
      } ],
      description: 'Creates a deep copy of the specified node and places it into the target container before the given anchor.',
      experimental: true
    },
    {
      name: 'moveTo',
      parameters: [ { '$ref': 'NodeId', description: 'Id of the node to move.' },
        {
          '$ref': 'NodeId',
          description: 'Id of the element to drop the moved node into.'
        },
        {
          '$ref': 'NodeId',
          optional: true,
          description: 'Drop node before this one (if absent, the moved node becomes the last child of <code>targetNodeId</code>).'
        } ],
      returns: [ {
        name: 'nodeId',
        '$ref': 'NodeId',
        description: 'New id of the moved node.'
      } ],
      description: 'Moves node into the new container, places it before the given anchor.'
    },
    {
      name: 'undo',
      description: 'Undoes the last performed action.',
      experimental: true
    },
    {
      name: 'redo',
      description: 'Re-does the last undone action.',
      experimental: true
    },
    {
      name: 'markUndoableState',
      description: 'Marks last undoable state.',
      experimental: true
    },
    {
      name: 'focus',
      parameters: [ { '$ref': 'NodeId', description: 'Id of the node to focus.' } ],
      description: 'Focuses the given element.',
      experimental: true
    },
    {
      name: 'setFileInputFiles',
      parameters: [ {
        '$ref': 'NodeId',
        description: 'Id of the file input node to set files for.'
      },
      {
        type: 'array',
        items: { type: 'string' },
        description: 'Array of file paths to set.'
      } ],
      description: 'Sets files for the given file input element.',
      experimental: true
    },
    {
      name: 'getBoxModel',
      parameters: [ {
        '$ref': 'NodeId',
        description: 'Id of the node to get box model for.'
      } ],
      returns: [ {
        name: 'model',
        '$ref': 'BoxModel',
        description: 'Box model for the node.'
      } ],
      description: 'Returns boxes for the currently selected nodes.',
      experimental: true
    },
    {
      name: 'getNodeForLocation',
      parameters: [ { type: 'integer', description: 'X coordinate.' },
          { type: 'integer', description: 'Y coordinate.' },
        {
          type: 'boolean',
          optional: true,
          description: 'False to skip to the nearest non-UA shadow root ancestor (default: false).'
        } ],
      returns: [ {
        name: 'nodeId',
        '$ref': 'NodeId',
        description: 'Id of the node at given coordinates.'
      } ],
      description: 'Returns node id at given location.',
      experimental: true
    },
    {
      name: 'getRelayoutBoundary',
      parameters: [ { '$ref': 'NodeId', description: 'Id of the node.' } ],
      returns: [ {
        name: 'nodeId',
        '$ref': 'NodeId',
        description: 'Relayout boundary node id for the given node.'
      } ],
      description: 'Returns the id of the nearest ancestor that is a relayout boundary.',
      experimental: true
    },
    {
      name: 'getHighlightObjectForTest',
      parameters: [ {
        '$ref': 'NodeId',
        description: 'Id of the node to get highlight object for.'
      } ],
      returns: [ {
        name: 'highlight',
        type: 'object',
        description: 'Highlight data for the node.'
      } ],
      description: 'For testing.',
      experimental: true
    } ],
    events: [ {
      name: 'documentUpdated',
      description: 'Fired when <code>Document</code> has been totally updated. Node ids are no longer valid.'
    },
    {
      name: 'inspectNodeRequested',
      parameters: [ {
        '$ref': 'BackendNodeId',
        description: 'Id of the node to inspect.'
      } ],
      description: 'Fired when the node should be inspected. This happens after call to <code>setInspectMode</code>.',
      experimental: true
    },
    {
      name: 'setChildNodes',
      parameters: [ {
        '$ref': 'NodeId',
        description: 'Parent node id to populate with children.'
      },
      {
        type: 'array',
        items: { '$ref': 'Node' },
        description: 'Child nodes array.'
      } ],
      description: 'Fired when backend wants to provide client with the missing DOM structure. This happens upon most of the calls requesting node ids.'
    },
    {
      name: 'attributeModified',
      parameters: [ {
        '$ref': 'NodeId',
        description: 'Id of the node that has changed.'
      },
          { type: 'string', description: 'Attribute name.' },
          { type: 'string', description: 'Attribute value.' } ],
      description: 'Fired when <code>Element</code>\'s attribute is modified.'
    },
    {
      name: 'attributeRemoved',
      parameters: [ {
        '$ref': 'NodeId',
        description: 'Id of the node that has changed.'
      },
          { type: 'string', description: 'A ttribute name.' } ],
      description: 'Fired when <code>Element</code>\'s attribute is removed.'
    },
    {
      name: 'inlineStyleInvalidated',
      parameters: [ {
        type: 'array',
        items: { '$ref': 'NodeId' },
        description: 'Ids of the nodes for which the inline styles have been invalidated.'
      } ],
      description: 'Fired when <code>Element</code>\'s inline style is modified via a CSS property modification.',
      experimental: true
    },
    {
      name: 'characterDataModified',
      parameters: [ {
        '$ref': 'NodeId',
        description: 'Id of the node that has changed.'
      },
          { type: 'string', description: 'New text value.' } ],
      description: 'Mirrors <code>DOMCharacterDataModified</code> event.'
    },
    {
      name: 'childNodeCountUpdated',
      parameters: [ {
        '$ref': 'NodeId',
        description: 'Id of the node that has changed.'
      },
          { type: 'integer', description: 'New node count.' } ],
      description: 'Fired when <code>Container</code>\'s child node count has changed.'
    },
    {
      name: 'childNodeInserted',
      parameters: [ {
        '$ref': 'NodeId',
        description: 'Id of the node that has changed.'
      },
          { '$ref': 'NodeId', description: 'If of the previous siblint.' },
          { '$ref': 'Node', description: 'Inserted node data.' } ],
      description: 'Mirrors <code>DOMNodeInserted</code> event.'
    },
    {
      name: 'childNodeRemoved',
      parameters: [ { '$ref': 'NodeId', description: 'Parent id.' },
        {
          '$ref': 'NodeId',
          description: 'Id of the node that has been removed.'
        } ],
      description: 'Mirrors <code>DOMNodeRemoved</code> event.'
    },
    {
      name: 'shadowRootPushed',
      parameters: [ { '$ref': 'NodeId', description: 'Host element id.' },
          { '$ref': 'Node', description: 'Shadow root.' } ],
      description: 'Called when shadow root is pushed into the element.',
      experimental: true
    },
    {
      name: 'shadowRootPopped',
      parameters: [ { '$ref': 'NodeId', description: 'Host element id.' },
          { '$ref': 'NodeId', description: 'Shadow root id.' } ],
      description: 'Called when shadow root is popped from the element.',
      experimental: true
    },
    {
      name: 'pseudoElementAdded',
      parameters: [ {
        '$ref': 'NodeId',
        description: 'Pseudo element\'s parent element id.'
      },
          { '$ref': 'Node', description: 'The added pseudo element.' } ],
      description: 'Called when a pseudo element is added to an element.',
      experimental: true
    },
    {
      name: 'pseudoElementRemoved',
      parameters: [ {
        '$ref': 'NodeId',
        description: 'Pseudo element\'s parent element id.'
      },
      {
        '$ref': 'NodeId',
        description: 'The removed pseudo element id.'
      } ],
      description: 'Called when a pseudo element is removed from an element.',
      experimental: true
    },
    {
      name: 'distributedNodesUpdated',
      parameters: [ {
        '$ref': 'NodeId',
        description: 'Insertion point where distrubuted nodes were updated.'
      },
      {
        type: 'array',
        items: { '$ref': 'BackendNode' },
        description: 'Distributed nodes for given insertion point.'
      } ],
      description: 'Called when distrubution is changed.',
      experimental: true
    },
    {
      name: 'nodeHighlightRequested',
      parameters: [ { '$ref': 'NodeId' } ],
      experimental: true
    } ]
  },
  CSS: {
    domain: 'CSS',
    experimental: true,
    description: 'This domain exposes CSS read/write operations. All CSS objects (stylesheets, rules, and styles) have an associated <code>id</code> used in subsequent operations on the related object. Each object type has a specific <code>id</code> structure, and those are not interchangeable between objects of different kinds. CSS objects can be loaded using the <code>get*ForNode()</code> calls (which accept a DOM node id). A client can also discover all the existing stylesheets with the <code>getAllStyleSheets()</code> method (or keeping track of the <code>styleSheetAdded</code>/<code>styleSheetRemoved</code> events) and subsequently load the required stylesheet contents using the <code>getStyleSheet[Text]()</code> methods.',
    dependencies: [ 'DOM' ],
    types: [ { id: 'StyleSheetId', type: 'string' },
      {
        id: 'StyleSheetOrigin',
        type: 'string',
        enum: [ 'injected', 'user-agent', 'inspector', 'regular' ],
        description: 'Stylesheet type: "injected" for stylesheets injected via extension, "user-agent" for user-agent stylesheets, "inspector" for stylesheets created by the inspector (i.e. those holding the "via inspector" rules), "regular" for regular stylesheets.'
      },
      {
        id: 'PseudoElementMatches',
        type: 'object',
        properties: [ {
          '$ref': 'DOM.PseudoType',
          description: 'Pseudo element type.'
        },
        {
          type: 'array',
          items: { '$ref': 'RuleMatch' },
          description: 'Matches of CSS rules applicable to the pseudo style.'
        } ],
        description: 'CSS rule collection for a single pseudo style.'
      },
      {
        id: 'InheritedStyleEntry',
        type: 'object',
        properties: [ {
          '$ref': 'CSSStyle',
          optional: true,
          description: 'The ancestor node\'s inline style, if any, in the style inheritance chain.'
        },
        {
          type: 'array',
          items: { '$ref': 'RuleMatch' },
          description: 'Matches of CSS rules matching the ancestor node in the style inheritance chain.'
        } ],
        description: 'Inherited CSS rule collection from ancestor node.'
      },
      {
        id: 'RuleMatch',
        type: 'object',
        properties: [ { '$ref': 'CSSRule', description: 'CSS rule in the match.' },
          {
            type: 'array',
            items: { type: 'integer' },
            description: 'Matching selector indices in the rule\'s selectorList selectors (0-based).'
          } ],
        description: 'Match data for a CSS rule.'
      },
      {
        id: 'Value',
        type: 'object',
        properties: [ { type: 'string', description: 'Value text.' },
          {
            '$ref': 'SourceRange',
            optional: true,
            description: 'Value range in the underlying resource (if available).'
          } ],
        description: 'Data for a simple selector (these are delimited by commas in a selector list).'
      },
      {
        id: 'SelectorList',
        type: 'object',
        properties: [ {
          type: 'array',
          items: { '$ref': 'Value' },
          description: 'Selectors in the list.'
        },
          { type: 'string', description: 'Rule selector text.' } ],
        description: 'Selector list data.'
      },
      {
        id: 'CSSStyleSheetHeader',
        type: 'object',
        properties: [ {
          '$ref': 'StyleSheetId',
          description: 'The stylesheet identifier.'
        },
        {
          '$ref': 'Page.FrameId',
          description: 'Owner frame identifier.'
        },
          { type: 'string', description: 'Stylesheet resource URL.' },
        {
          type: 'string',
          optional: true,
          description: 'URL of source map associated with the stylesheet (if any).'
        },
        {
          '$ref': 'StyleSheetOrigin',
          description: 'Stylesheet origin.'
        },
          { type: 'string', description: 'Stylesheet title.' },
        {
          '$ref': 'DOM.BackendNodeId',
          optional: true,
          description: 'The backend id for the owner node of the stylesheet.'
        },
        {
          type: 'boolean',
          description: 'Denotes whether the stylesheet is disabled.'
        },
        {
          type: 'boolean',
          optional: true,
          description: 'Whether the sourceURL field value comes from the sourceURL comment.'
        },
        {
          type: 'boolean',
          description: 'Whether this stylesheet is created for STYLE tag by parser. This flag is not set for document.written STYLE tags.'
        },
        {
          type: 'number',
          description: 'Line offset of the stylesheet within the resource (zero based).'
        },
        {
          type: 'number',
          description: 'Column offset of the stylesheet within the resource (zero based).'
        },
        {
          type: 'number',
          description: 'Size of the content (in characters).',
          experimental: true
        } ],
        description: 'CSS stylesheet metainformation.'
      },
      {
        id: 'CSSRule',
        type: 'object',
        properties: [ {
          '$ref': 'StyleSheetId',
          optional: true,
          description: 'The css style sheet identifier (absent for user agent stylesheet and user-specified stylesheet rules) this rule came from.'
        },
          { '$ref': 'SelectorList', description: 'Rule selector data.' },
        {
          '$ref': 'StyleSheetOrigin',
          description: 'Parent stylesheet\'s origin.'
        },
        {
          '$ref': 'CSSStyle',
          description: 'Associated style declaration.'
        },
        {
          type: 'array',
          items: { '$ref': 'CSSMedia' },
          optional: true,
          description: 'Media list array (for rules involving media queries). The array enumerates media queries starting with the innermost one, going outwards.'
        } ],
        description: 'CSS rule representation.'
      },
      {
        id: 'RuleUsage',
        type: 'object',
        properties: [ {
          '$ref': 'StyleSheetId',
          description: 'The css style sheet identifier (absent for user agent stylesheet and user-specified stylesheet rules) this rule came from.'
        },
        {
          type: 'number',
          description: 'Offset of the start of the rule (including selector) from the beginning of the stylesheet.'
        },
        {
          type: 'number',
          description: 'Offset of the end of the rule body from the beginning of the stylesheet.'
        },
        {
          type: 'boolean',
          description: 'Indicates whether the rule was actually used by some element in the page.'
        } ],
        description: 'CSS coverage information.',
        experimental: true
      },
      {
        id: 'SourceRange',
        type: 'object',
        properties: [ { type: 'integer', description: 'Start line of range.' },
          {
            type: 'integer',
            description: 'Start column of range (inclusive).'
          },
          { type: 'integer', description: 'End line of range' },
          {
            type: 'integer',
            description: 'End column of range (exclusive).'
          } ],
        description: 'Text range within a resource. All numbers are zero-based.'
      },
      {
        id: 'ShorthandEntry',
        type: 'object',
        properties: [ { type: 'string', description: 'Shorthand name.' },
          { type: 'string', description: 'Shorthand value.' },
          {
            type: 'boolean',
            optional: true,
            description: 'Whether the property has "!important" annotation (implies <code>false</code> if absent).'
          } ]
      },
      {
        id: 'CSSComputedStyleProperty',
        type: 'object',
        properties: [ { type: 'string', description: 'Computed style property name.' },
          {
            type: 'string',
            description: 'Computed style property value.'
          } ]
      },
      {
        id: 'CSSStyle',
        type: 'object',
        properties: [ {
          '$ref': 'StyleSheetId',
          optional: true,
          description: 'The css style sheet identifier (absent for user agent stylesheet and user-specified stylesheet rules) this rule came from.'
        },
        {
          type: 'array',
          items: { '$ref': 'CSSProperty' },
          description: 'CSS properties in the style.'
        },
        {
          type: 'array',
          items: { '$ref': 'ShorthandEntry' },
          description: 'Computed values for all shorthands found in the style.'
        },
        {
          type: 'string',
          optional: true,
          description: 'Style declaration text (if available).'
        },
        {
          '$ref': 'SourceRange',
          optional: true,
          description: 'Style declaration range in the enclosing stylesheet (if available).'
        } ],
        description: 'CSS style representation.'
      },
      {
        id: 'CSSProperty',
        type: 'object',
        properties: [ { type: 'string', description: 'The property name.' },
          { type: 'string', description: 'The property value.' },
          {
            type: 'boolean',
            optional: true,
            description: 'Whether the property has "!important" annotation (implies <code>false</code> if absent).'
          },
          {
            type: 'boolean',
            optional: true,
            description: 'Whether the property is implicit (implies <code>false</code> if absent).'
          },
          {
            type: 'string',
            optional: true,
            description: 'The full property text as specified in the style.'
          },
          {
            type: 'boolean',
            optional: true,
            description: 'Whether the property is understood by the browser (implies <code>true</code> if absent).'
          },
          {
            type: 'boolean',
            optional: true,
            description: 'Whether the property is disabled by the user (present for source-based properties only).'
          },
          {
            '$ref': 'SourceRange',
            optional: true,
            description: 'The entire property range in the enclosing style declaration (if available).'
          } ],
        description: 'CSS property declaration data.'
      },
      {
        id: 'CSSMedia',
        type: 'object',
        properties: [ { type: 'string', description: 'Media query text.' },
          {
            type: 'string',
            enum: [ 'mediaRule', 'importRule', 'linkedSheet', 'inlineSheet' ],
            description: 'Source of the media query: "mediaRule" if specified by a @media rule, "importRule" if specified by an @import rule, "linkedSheet" if specified by a "media" attribute in a linked stylesheet\'s LINK tag, "inlineSheet" if specified by a "media" attribute in an inline stylesheet\'s STYLE tag.'
          },
          {
            type: 'string',
            optional: true,
            description: 'URL of the document containing the media query description.'
          },
          {
            '$ref': 'SourceRange',
            optional: true,
            description: 'The associated rule (@media or @import) header range in the enclosing stylesheet (if available).'
          },
          {
            '$ref': 'StyleSheetId',
            optional: true,
            description: 'Identifier of the stylesheet containing this object (if exists).'
          },
          {
            type: 'array',
            items: { '$ref': 'MediaQuery' },
            optional: true,
            experimental: true,
            description: 'Array of media queries.'
          } ],
        description: 'CSS media rule descriptor.'
      },
      {
        id: 'MediaQuery',
        type: 'object',
        properties: [ {
          type: 'array',
          items: { '$ref': 'MediaQueryExpression' },
          description: 'Array of media query expressions.'
        },
        {
          type: 'boolean',
          description: 'Whether the media query condition is satisfied.'
        } ],
        description: 'Media query descriptor.',
        experimental: true
      },
      {
        id: 'MediaQueryExpression',
        type: 'object',
        properties: [ { type: 'number', description: 'Media query expression value.' },
          { type: 'string', description: 'Media query expression units.' },
          {
            type: 'string',
            description: 'Media query expression feature.'
          },
          {
            '$ref': 'SourceRange',
            optional: true,
            description: 'The associated range of the value text in the enclosing stylesheet (if available).'
          },
          {
            type: 'number',
            optional: true,
            description: 'Computed length of media query expression (if applicable).'
          } ],
        description: 'Media query expression descriptor.',
        experimental: true
      },
      {
        id: 'PlatformFontUsage',
        type: 'object',
        properties: [ {
          type: 'string',
          description: 'Font\'s family name reported by platform.'
        },
        {
          type: 'boolean',
          description: 'Indicates if the font was downloaded or resolved locally.'
        },
        {
          type: 'number',
          description: 'Amount of glyphs that were rendered with this font.'
        } ],
        description: 'Information about amount of glyphs that were rendered with given font.',
        experimental: true
      },
      {
        id: 'CSSKeyframesRule',
        type: 'object',
        properties: [ { '$ref': 'Value', description: 'Animation name.' },
          {
            type: 'array',
            items: { '$ref': 'CSSKeyframeRule' },
            description: 'List of keyframes.'
          } ],
        description: 'CSS keyframes rule representation.'
      },
      {
        id: 'CSSKeyframeRule',
        type: 'object',
        properties: [ {
          '$ref': 'StyleSheetId',
          optional: true,
          description: 'The css style sheet identifier (absent for user agent stylesheet and user-specified stylesheet rules) this rule came from.'
        },
        {
          '$ref': 'StyleSheetOrigin',
          description: 'Parent stylesheet\'s origin.'
        },
          { '$ref': 'Value', description: 'Associated key text.' },
        {
          '$ref': 'CSSStyle',
          description: 'Associated style declaration.'
        } ],
        description: 'CSS keyframe rule representation.'
      },
      {
        id: 'StyleDeclarationEdit',
        type: 'object',
        properties: [ {
          '$ref': 'StyleSheetId',
          description: 'The css style sheet identifier.'
        },
        {
          '$ref': 'SourceRange',
          description: 'The range of the style text in the enclosing stylesheet.'
        },
          { type: 'string', description: 'New style text.' } ],
        description: 'A descriptor of operation to mutate style declaration text.'
      },
      {
        id: 'InlineTextBox',
        type: 'object',
        properties: [ {
          '$ref': 'DOM.Rect',
          description: 'The absolute position bounding box.'
        },
        {
          type: 'integer',
          description: 'The starting index in characters, for this post layout textbox substring.'
        },
        {
          type: 'integer',
          description: 'The number of characters in this post layout textbox substring.'
        } ],
        description: 'Details of post layout rendered text positions. The exact layout should not be regarded as stable and may change between versions.',
        experimental: true
      },
      {
        id: 'LayoutTreeNode',
        type: 'object',
        properties: [ {
          '$ref': 'DOM.NodeId',
          description: 'The id of the related DOM node matching one from DOM.GetDocument.'
        },
        {
          '$ref': 'DOM.Rect',
          description: 'The absolute position bounding box.'
        },
        {
          type: 'string',
          optional: true,
          description: 'Contents of the LayoutText if any'
        },
        {
          type: 'array',
          optional: true,
          items: { '$ref': 'InlineTextBox' },
          description: 'The post layout inline text nodes, if any.'
        },
        {
          type: 'integer',
          optional: true,
          description: 'Index into the computedStyles array returned by getLayoutTreeAndStyles.'
        } ],
        description: 'Details of an element in the DOM tree with a LayoutObject.',
        experimental: true
      },
      {
        id: 'ComputedStyle',
        type: 'object',
        properties: [ { type: 'array', items: { '$ref': 'CSSComputedStyleProperty' } } ],
        description: 'A subset of the full ComputedStyle as defined by the request whitelist.',
        experimental: true
      } ],
    commands: [ {
      name: 'enable',
      description: 'Enables the CSS agent for the given page. Clients should not assume that the CSS agent has been enabled until the result of this command is received.'
    },
    {
      name: 'disable',
      description: 'Disables the CSS agent for the given page.'
    },
    {
      name: 'getMatchedStylesForNode',
      parameters: [ { '$ref': 'DOM.NodeId' } ],
      returns: [ {
        name: 'inlineStyle',
        '$ref': 'CSSStyle',
        optional: true,
        description: 'Inline style for the specified DOM node.'
      },
      {
        name: 'attributesStyle',
        '$ref': 'CSSStyle',
        optional: true,
        description: 'Attribute-defined element style (e.g. resulting from "width=20 height=100%").'
      },
      {
        name: 'matchedCSSRules',
        type: 'array',
        items: { '$ref': 'RuleMatch' },
        optional: true,
        description: 'CSS rules matching this node, from all applicable stylesheets.'
      },
      {
        name: 'pseudoElements',
        type: 'array',
        items: { '$ref': 'PseudoElementMatches' },
        optional: true,
        description: 'Pseudo style matches for this node.'
      },
      {
        name: 'inherited',
        type: 'array',
        items: { '$ref': 'InheritedStyleEntry' },
        optional: true,
        description: 'A chain of inherited styles (from the immediate node parent up to the DOM tree root).'
      },
      {
        name: 'cssKeyframesRules',
        type: 'array',
        items: { '$ref': 'CSSKeyframesRule' },
        optional: true,
        description: 'A list of CSS keyframed animations matching this node.'
      } ],
      description: 'Returns requested styles for a DOM node identified by <code>nodeId</code>.'
    },
    {
      name: 'getInlineStylesForNode',
      parameters: [ { '$ref': 'DOM.NodeId' } ],
      returns: [ {
        name: 'inlineStyle',
        '$ref': 'CSSStyle',
        optional: true,
        description: 'Inline style for the specified DOM node.'
      },
      {
        name: 'attributesStyle',
        '$ref': 'CSSStyle',
        optional: true,
        description: 'Attribute-defined element style (e.g. resulting from "width=20 height=100%").'
      } ],
      description: 'Returns the styles defined inline (explicitly in the "style" attribute and implicitly, using DOM attributes) for a DOM node identified by <code>nodeId</code>.'
    },
    {
      name: 'getComputedStyleForNode',
      parameters: [ { '$ref': 'DOM.NodeId' } ],
      returns: [ {
        name: 'computedStyle',
        type: 'array',
        items: { '$ref': 'CSSComputedStyleProperty' },
        description: 'Computed style for the specified DOM node.'
      } ],
      description: 'Returns the computed style for a DOM node identified by <code>nodeId</code>.'
    },
    {
      name: 'getPlatformFontsForNode',
      parameters: [ { '$ref': 'DOM.NodeId' } ],
      returns: [ {
        name: 'fonts',
        type: 'array',
        items: { '$ref': 'PlatformFontUsage' },
        description: 'Usage statistics for every employed platform font.'
      } ],
      description: 'Requests information about platform fonts which we used to render child TextNodes in the given node.',
      experimental: true
    },
    {
      name: 'getStyleSheetText',
      parameters: [ { '$ref': 'StyleSheetId' } ],
      returns: [ {
        name: 'text',
        type: 'string',
        description: 'The stylesheet text.'
      } ],
      description: 'Returns the current textual content and the URL for a stylesheet.'
    },
    {
      name: 'collectClassNames',
      parameters: [ { '$ref': 'StyleSheetId' } ],
      returns: [ {
        name: 'classNames',
        type: 'array',
        items: { type: 'string' },
        description: 'Class name list.'
      } ],
      description: 'Returns all class names from specified stylesheet.',
      experimental: true
    },
    {
      name: 'setStyleSheetText',
      parameters: [ { '$ref': 'StyleSheetId' }, { type: 'string' } ],
      returns: [ {
        name: 'sourceMapURL',
        type: 'string',
        optional: true,
        description: 'URL of source map associated with script (if any).'
      } ],
      description: 'Sets the new stylesheet text.'
    },
    {
      name: 'setRuleSelector',
      parameters: [ { '$ref': 'StyleSheetId' },
          { '$ref': 'SourceRange' },
          { type: 'string' } ],
      returns: [ {
        name: 'selectorList',
        '$ref': 'SelectorList',
        description: 'The resulting selector list after modification.'
      } ],
      description: 'Modifies the rule selector.'
    },
    {
      name: 'setKeyframeKey',
      parameters: [ { '$ref': 'StyleSheetId' },
          { '$ref': 'SourceRange' },
          { type: 'string' } ],
      returns: [ {
        name: 'keyText',
        '$ref': 'Value',
        description: 'The resulting key text after modification.'
      } ],
      description: 'Modifies the keyframe rule key text.'
    },
    {
      name: 'setStyleTexts',
      parameters: [ { type: 'array', items: { '$ref': 'StyleDeclarationEdit' } } ],
      returns: [ {
        name: 'styles',
        type: 'array',
        items: { '$ref': 'CSSStyle' },
        description: 'The resulting styles after modification.'
      } ],
      description: 'Applies specified style edits one after another in the given order.'
    },
    {
      name: 'setMediaText',
      parameters: [ { '$ref': 'StyleSheetId' },
          { '$ref': 'SourceRange' },
          { type: 'string' } ],
      returns: [ {
        name: 'media',
        '$ref': 'CSSMedia',
        description: 'The resulting CSS media rule after modification.'
      } ],
      description: 'Modifies the rule selector.'
    },
    {
      name: 'createStyleSheet',
      parameters: [ {
        '$ref': 'Page.FrameId',
        description: 'Identifier of the frame where "via-inspector" stylesheet should be created.'
      } ],
      returns: [ {
        name: 'styleSheetId',
        '$ref': 'StyleSheetId',
        description: 'Identifier of the created "via-inspector" stylesheet.'
      } ],
      description: 'Creates a new special "via-inspector" stylesheet in the frame with given <code>frameId</code>.'
    },
    {
      name: 'addRule',
      parameters: [ {
        '$ref': 'StyleSheetId',
        description: 'The css style sheet identifier where a new rule should be inserted.'
      },
          { type: 'string', description: 'The text of a new rule.' },
      {
        '$ref': 'SourceRange',
        description: 'Text position of a new rule in the target style sheet.'
      } ],
      returns: [ {
        name: 'rule',
        '$ref': 'CSSRule',
        description: 'The newly created rule.'
      } ],
      description: 'Inserts a new rule with the given <code>ruleText</code> in a stylesheet with given <code>styleSheetId</code>, at the position specified by <code>location</code>.'
    },
    {
      name: 'forcePseudoState',
      parameters: [ {
        '$ref': 'DOM.NodeId',
        description: 'The element id for which to force the pseudo state.'
      },
      {
        type: 'array',
        items: {
          type: 'string',
          enum: [ 'active', 'focus', 'hover', 'visited' ]
        },
        description: 'Element pseudo classes to force when computing the element\'s style.'
      } ],
      description: 'Ensures that the given node will have specified pseudo-classes whenever its style is computed by the browser.'
    },
    {
      name: 'getMediaQueries',
      returns: [ { name: 'medias', type: 'array', items: { '$ref': 'CSSMedia' } } ],
      description: 'Returns all media queries parsed by the rendering engine.',
      experimental: true
    },
    {
      name: 'setEffectivePropertyValueForNode',
      parameters: [ {
        '$ref': 'DOM.NodeId',
        description: 'The element id for which to set property.'
      },
          { type: 'string' },
          { type: 'string' } ],
      description: 'Find a rule with the given active property for the given node and set the new value for this property',
      experimental: true
    },
    {
      name: 'getBackgroundColors',
      parameters: [ {
        '$ref': 'DOM.NodeId',
        description: 'Id of the node to get background colors for.'
      } ],
      returns: [ {
        name: 'backgroundColors',
        type: 'array',
        items: { type: 'string' },
        description: 'The range of background colors behind this element, if it contains any visible text. If no visible text is present, this will be undefined. In the case of a flat background color, this will consist of simply that color. In the case of a gradient, this will consist of each of the color stops. For anything more complicated, this will be an empty array. Images will be ignored (as if the image had failed to load).',
        optional: true
      } ],
      experimental: true
    },
    {
      name: 'getLayoutTreeAndStyles',
      parameters: [ {
        type: 'array',
        items: { type: 'string' },
        description: 'Whitelist of computed styles to return.'
      } ],
      returns: [ {
        name: 'layoutTreeNodes',
        type: 'array',
        items: { '$ref': 'LayoutTreeNode' }
      },
      {
        name: 'computedStyles',
        type: 'array',
        items: [ {'$ref': 'ComputedStyle' }]
      } ],
      description: 'For the main document and any content documents, return the LayoutTreeNodes and a whitelisted subset of the computed style. It only returns pushed nodes, on way to pull all nodes is to call DOM.getDocument with a depth of -1.',
      experimental: true
    },
    {
      name: 'startRuleUsageTracking',
      description: 'Enables the selector recording.',
      experimental: true
    },
    {
      name: 'takeCoverageDelta',
      description: 'Obtain list of rules that became used since last call to this method (or since start of coverage instrumentation)',
      returns: [ {
        name: 'coverage',
        type: 'array',
        items: { '$ref': 'RuleUsage' }
      } ],
      experimental: true
    },
    {
      name: 'stopRuleUsageTracking',
      returns: [ {
        name: 'ruleUsage',
        type: 'array',
        items: { '$ref': 'RuleUsage' }
      } ],
      description: 'The list of rules with an indication of whether these were used',
      experimental: true
    } ],
    events: [ {
      name: 'mediaQueryResultChanged',
      description: 'Fires whenever a MediaQuery result changes (for example, after a browser window has been resized.) The current implementation considers only viewport-dependent media features.'
    },
    {
      name: 'fontsUpdated',
      description: 'Fires whenever a web font gets loaded.'
    },
    {
      name: 'styleSheetChanged',
      parameters: [ { '$ref': 'StyleSheetId' } ],
      description: 'Fired whenever a stylesheet is changed as a result of the client operation.'
    },
    {
      name: 'styleSheetAdded',
      parameters: [ {
        '$ref': 'CSSStyleSheetHeader',
        description: 'Added stylesheet metainfo.'
      } ],
      description: 'Fired whenever an active document stylesheet is added.'
    },
    {
      name: 'styleSheetRemoved',
      parameters: [ {
        '$ref': 'StyleSheetId',
        description: 'Identifier of the removed stylesheet.'
      } ],
      description: 'Fired whenever an active document stylesheet is removed.'
    } ]
  },
  IO: {
    domain: 'IO',
    description: 'Input/Output operations for streams produced by DevTools.',
    experimental: true,
    types: [ { id: 'StreamHandle', type: 'string' } ],
    commands: [ {
      name: 'read',
      description: 'Read a chunk of the stream',
      parameters: [ {
        '$ref': 'StreamHandle',
        description: 'Handle of the stream to read.'
      },
      {
        type: 'integer',
        optional: true,
        description: 'Seek to the specified offset before reading (if not specificed, proceed with offset following the last read).'
      },
      {
        type: 'integer',
        optional: true,
        description: 'Maximum number of bytes to read (left upon the agent discretion if not specified).'
      } ],
      returns: [ {
        name: 'data',
        type: 'string',
        description: 'Data that were read.'
      },
      {
        name: 'eof',
        type: 'boolean',
        description: 'Set if the end-of-file condition occured while reading.'
      } ]
    },
    {
      name: 'close',
      description: 'Close the stream, discard any temporary backing storage.',
      parameters: [ {
        '$ref': 'StreamHandle',
        description: 'Handle of the stream to close.'
      } ]
    } ]
  },
  DOMDebugger: {
    domain: 'DOMDebugger',
    description: 'DOM debugging allows setting breakpoints on particular DOM operations and events. JavaScript execution will stop on these operations as if there was a regular breakpoint set.',
    dependencies: [ 'DOM', 'Debugger' ],
    types: [ {
      id: 'DOMBreakpointType',
      type: 'string',
      enum: [ 'subtree-modified', 'attribute-modified', 'node-removed' ],
      description: 'DOM breakpoint type.'
    },
    {
      id: 'EventListener',
      type: 'object',
      description: 'Object event listener.',
      properties: [ {
        type: 'string',
        description: '<code>EventListener</code>\'s type.'
      },
      {
        type: 'boolean',
        description: '<code>EventListener</code>\'s useCapture.'
      },
      {
        type: 'boolean',
        description: '<code>EventListener</code>\'s passive flag.'
      },
      {
        type: 'boolean',
        description: '<code>EventListener</code>\'s once flag.'
      },
      {
        '$ref': 'Runtime.ScriptId',
        description: 'Script id of the handler code.'
      },
      {
        type: 'integer',
        description: 'Line number in the script (0-based).'
      },
      {
        type: 'integer',
        description: 'Column number in the script (0-based).'
      },
      {
        '$ref': 'Runtime.RemoteObject',
        optional: true,
        description: 'Event handler function value.'
      },
      {
        '$ref': 'Runtime.RemoteObject',
        optional: true,
        description: 'Event original handler function value.'
      },
      {
        '$ref': 'DOM.BackendNodeId',
        optional: true,
        description: 'Node the listener is added to (if any).'
      } ],
      experimental: true
    } ],
    commands: [ {
      name: 'setDOMBreakpoint',
      parameters: [ {
        '$ref': 'DOM.NodeId',
        description: 'Identifier of the node to set breakpoint on.'
      },
      {
        '$ref': 'DOMBreakpointType',
        description: 'Type of the operation to stop upon.'
      } ],
      description: 'Sets breakpoint on particular operation with DOM.'
    },
    {
      name: 'removeDOMBreakpoint',
      parameters: [ {
        '$ref': 'DOM.NodeId',
        description: 'Identifier of the node to remove breakpoint from.'
      },
      {
        '$ref': 'DOMBreakpointType',
        description: 'Type of the breakpoint to remove.'
      } ],
      description: 'Removes DOM breakpoint that was set using <code>setDOMBreakpoint</code>.'
    },
    {
      name: 'setEventListenerBreakpoint',
      parameters: [ {
        type: 'string',
        description: 'DOM Event name to stop on (any DOM event will do).'
      },
      {
        type: 'string',
        optional: true,
        description: 'EventTarget interface name to stop on. If equal to <code>"*"</code> or not provided, will stop on any EventTarget.',
        experimental: true
      } ],
      description: 'Sets breakpoint on particular DOM event.'
    },
    {
      name: 'removeEventListenerBreakpoint',
      parameters: [ { type: 'string', description: 'Event name.' },
        {
          type: 'string',
          optional: true,
          description: 'EventTarget interface name.',
          experimental: true
        } ],
      description: 'Removes breakpoint on particular DOM event.'
    },
    {
      name: 'setInstrumentationBreakpoint',
      parameters: [ {
        type: 'string',
        description: 'Instrumentation name to stop on.'
      } ],
      description: 'Sets breakpoint on particular native event.',
      experimental: true
    },
    {
      name: 'removeInstrumentationBreakpoint',
      parameters: [ {
        type: 'string',
        description: 'Instrumentation name to stop on.'
      } ],
      description: 'Removes breakpoint on particular native event.',
      experimental: true
    },
    {
      name: 'setXHRBreakpoint',
      parameters: [ {
        type: 'string',
        description: 'Resource URL substring. All XHRs having this substring in the URL will get stopped upon.'
      } ],
      description: 'Sets breakpoint on XMLHttpRequest.'
    },
    {
      name: 'removeXHRBreakpoint',
      parameters: [ { type: 'string', description: 'Resource URL substring.' } ],
      description: 'Removes breakpoint from XMLHttpRequest.'
    },
    {
      name: 'getEventListeners',
      experimental: true,
      parameters: [ {
        '$ref': 'Runtime.RemoteObjectId',
        description: 'Identifier of the object to return listeners for.'
      },
      {
        type: 'integer',
        optional: true,
        description: 'The maximum depth at which Node children should be retrieved, defaults to 1. Use -1 for the entire subtree or provide an integer larger than 0.',
        experimental: true
      },
      {
        type: 'boolean',
        optional: true,
        description: 'Whether or not iframes and shadow roots should be traversed when returning the subtree (default is false). Reports listeners for all contexts if pierce is enabled.',
        experimental: true
      } ],
      returns: [ {
        name: 'listeners',
        type: 'array',
        items: { '$ref': 'EventListener' },
        description: 'Array of relevant listeners.'
      } ],
      description: 'Returns event listeners of the given object.'
    } ]
  },
  Target: {
    domain: 'Target',
    description: 'Supports additional targets discovery and allows to attach to them.',
    experimental: true,
    types: [ { id: 'TargetID', type: 'string' },
      { id: 'BrowserContextID', type: 'string' },
      {
        id: 'TargetInfo',
        type: 'object',
        properties: [ { '$ref': 'TargetID' },
          { type: 'string' },
          { type: 'string' },
          { type: 'string' } ]
      },
      {
        id: 'RemoteLocation',
        type: 'object',
        properties: [ { type: 'string' }, { type: 'integer' } ]
      } ],
    commands: [ {
      name: 'setDiscoverTargets',
      description: 'Controls whether to discover available targets and notify via <code>targetCreated/targetDestroyed</code> events.',
      parameters: [ {
        type: 'boolean',
        description: 'Whether to discover available targets.'
      } ]
    },
    {
      name: 'setAutoAttach',
      description: 'Controls whether to automatically attach to new targets which are considered to be related to this one. When turned on, attaches to all existing related targets as well. When turned off, automatically detaches from all currently attached targets.',
      parameters: [ {
        type: 'boolean',
        description: 'Whether to auto-attach to related targets.'
      },
      {
        type: 'boolean',
        description: 'Whether to pause new targets when attaching to them. Use <code>Runtime.runIfWaitingForDebugger</code> to run paused targets.'
      } ]
    },
    {
      name: 'setAttachToFrames',
      parameters: [ { type: 'boolean', description: 'Whether to attach to frames.' } ]
    },
    {
      name: 'setRemoteLocations',
      description: 'Enables target discovery for the specified locations, when <code>setDiscoverTargets</code> was set to <code>true</code>.',
      parameters: [ {
        type: 'array',
        items: { '$ref': 'RemoteLocation' },
        description: 'List of remote locations.'
      } ]
    },
    {
      name: 'sendMessageToTarget',
      description: 'Sends protocol message to the target with given id.',
      parameters: [ { '$ref': 'TargetID' }, { type: 'string' } ]
    },
    {
      name: 'getTargetInfo',
      description: 'Returns information about a target.',
      parameters: [ { '$ref': 'TargetID' } ],
      returns: [ { name: 'targetInfo', '$ref': 'TargetInfo' } ]
    },
    {
      name: 'activateTarget',
      description: 'Activates (focuses) the target.',
      parameters: [ { '$ref': 'TargetID' } ]
    },
    {
      name: 'closeTarget',
      description: 'Closes the target. If the target is a page that gets closed too.',
      parameters: [ { '$ref': 'TargetID' } ],
      returns: [ { name: 'success', type: 'boolean' } ]
    },
    {
      name: 'attachToTarget',
      description: 'Attaches to the target with given id.',
      parameters: [ { '$ref': 'TargetID' } ],
      returns: [ {
        name: 'success',
        type: 'boolean',
        description: 'Whether attach succeeded.'
      } ]
    },
    {
      name: 'detachFromTarget',
      description: 'Detaches from the target with given id.',
      parameters: [ { '$ref': 'TargetID' } ]
    },
    {
      name: 'createBrowserContext',
      description: 'Creates a new empty BrowserContext. Similar to an incognito profile but you can have more than one.',
      returns: [ {
        name: 'browserContextId',
        '$ref': 'BrowserContextID',
        description: 'The id of the context created.'
      } ]
    },
    {
      name: 'disposeBrowserContext',
      description: 'Deletes a BrowserContext, will fail of any open page uses it.',
      parameters: [ { '$ref': 'BrowserContextID' } ],
      returns: [ { name: 'success', type: 'boolean' } ]
    },
    {
      name: 'createTarget',
      description: 'Creates a new page.',
      parameters: [ {
        type: 'string',
        description: 'The initial URL the page will be navigated to.'
      },
      {
        type: 'integer',
        description: 'Frame width in DIP (headless chrome only).',
        optional: true
      },
      {
        type: 'integer',
        description: 'Frame height in DIP (headless chrome only).',
        optional: true
      },
      {
        '$ref': 'BrowserContextID',
        description: 'The browser context to create the page in (headless chrome only).',
        optional: true
      } ],
      returns: [ {
        name: 'targetId',
        '$ref': 'TargetID',
        description: 'The id of the page opened.'
      } ]
    },
    {
      name: 'getTargets',
      description: 'Retrieves a list of available targets.',
      returns: [ {
        name: 'targetInfos',
        type: 'array',
        items: { '$ref': 'TargetInfo' },
        description: 'The list of targets.'
      } ]
    } ],
    events: [ {
      name: 'targetCreated',
      description: 'Issued when a possible inspection target is created.',
      parameters: [ { '$ref': 'TargetInfo' } ]
    },
    {
      name: 'targetDestroyed',
      description: 'Issued when a target is destroyed.',
      parameters: [ { '$ref': 'TargetID' } ]
    },
    {
      name: 'attachedToTarget',
      description: 'Issued when attached to target because of auto-attach or <code>attachToTarget</code> command.',
      parameters: [ { '$ref': 'TargetInfo' }, { type: 'boolean' } ]
    },
    {
      name: 'detachedFromTarget',
      description: 'Issued when detached from target for any reason (including <code>detachFromTarget</code> command).',
      parameters: [ { '$ref': 'TargetID' } ]
    },
    {
      name: 'receivedMessageFromTarget',
      description: 'Notifies about new protocol message from attached target.',
      parameters: [ { '$ref': 'TargetID' }, { type: 'string' } ]
    } ]
  },
  ServiceWorker: {
    domain: 'ServiceWorker',
    experimental: true,
    types: [ {
      id: 'ServiceWorkerRegistration',
      type: 'object',
      description: 'ServiceWorker registration.',
      properties: [ { type: 'string' }, { type: 'string' }, { type: 'boolean' } ]
    },
    {
      id: 'ServiceWorkerVersionRunningStatus',
      type: 'string',
      enum: [ 'stopped', 'starting', 'running', 'stopping' ]
    },
    {
      id: 'ServiceWorkerVersionStatus',
      type: 'string',
      enum: [ 'new',
        'installing',
        'installed',
        'activating',
        'activated',
        'redundant' ]
    },
    {
      id: 'ServiceWorkerVersion',
      type: 'object',
      description: 'ServiceWorker version.',
      properties: [ { type: 'string' },
          { type: 'string' },
          { type: 'string' },
          { '$ref': 'ServiceWorkerVersionRunningStatus' },
          { '$ref': 'ServiceWorkerVersionStatus' },
        {
          type: 'number',
          optional: true,
          description: 'The Last-Modified header value of the main script.'
        },
        {
          type: 'number',
          optional: true,
          description: 'The time at which the response headers of the main script were received from the server.  For cached script it is the last time the cache entry was validated.'
        },
        {
          type: 'array',
          optional: true,
          items: { '$ref': 'Target.TargetID' }
        },
          { '$ref': 'Target.TargetID', optional: true } ]
    },
    {
      id: 'ServiceWorkerErrorMessage',
      type: 'object',
      description: 'ServiceWorker error message.',
      properties: [ { type: 'string' },
          { type: 'string' },
          { type: 'string' },
          { type: 'string' },
          { type: 'integer' },
          { type: 'integer' } ]
    } ],
    commands: [ { name: 'enable' },
      { name: 'disable' },
      { name: 'unregister', parameters: [ { type: 'string' } ] },
      {
        name: 'updateRegistration',
        parameters: [ { type: 'string' } ]
      },
      { name: 'startWorker', parameters: [ { type: 'string' } ] },
      { name: 'skipWaiting', parameters: [ { type: 'string' } ] },
      { name: 'stopWorker', parameters: [ { type: 'string' } ] },
      { name: 'inspectWorker', parameters: [ { type: 'string' } ] },
      {
        name: 'setForceUpdateOnPageLoad',
        parameters: [ { type: 'boolean' } ]
      },
      {
        name: 'deliverPushMessage',
        parameters: [ { type: 'string' }, { type: 'string' }, { type: 'string' } ]
      },
      {
        name: 'dispatchSyncEvent',
        parameters: [ { type: 'string' },
          { type: 'string' },
          { type: 'string' },
          { type: 'boolean' } ]
      } ],
    events: [ {
      name: 'workerRegistrationUpdated',
      parameters: [ {
        type: 'array',
        items: { '$ref': 'ServiceWorkerRegistration' }
      } ]
    },
    {
      name: 'workerVersionUpdated',
      parameters: [ { type: 'array', items: { '$ref': 'ServiceWorkerVersion' } } ]
    },
    {
      name: 'workerErrorReported',
      parameters: [ { '$ref': 'ServiceWorkerErrorMessage' } ]
    } ]
  },
  Input: {
    domain: 'Input',
    types: [ {
      id: 'TouchPoint',
      type: 'object',
      experimental: true,
      properties: [ {
        type: 'string',
        enum: [ 'touchPressed',
          'touchReleased',
          'touchMoved',
          'touchStationary',
          'touchCancelled' ],
        description: 'State of the touch point.'
      },
      {
        type: 'integer',
        description: 'X coordinate of the event relative to the main frame\'s viewport.'
      },
      {
        type: 'integer',
        description: 'Y coordinate of the event relative to the main frame\'s viewport. 0 refers to the top of the viewport and Y increases as it proceeds towards the bottom of the viewport.'
      },
      {
        type: 'integer',
        optional: true,
        description: 'X radius of the touch area (default: 1).'
      },
      {
        type: 'integer',
        optional: true,
        description: 'Y radius of the touch area (default: 1).'
      },
      {
        type: 'number',
        optional: true,
        description: 'Rotation angle (default: 0.0).'
      },
      {
        type: 'number',
        optional: true,
        description: 'Force (default: 1.0).'
      },
      {
        type: 'number',
        optional: true,
        description: 'Identifier used to track touch sources between events, must be unique within an event.'
      } ]
    },
    {
      id: 'GestureSourceType',
      type: 'string',
      experimental: true,
      enum: [ 'default', 'touch', 'mouse' ]
    } ],
    commands: [ {
      name: 'dispatchKeyEvent',
      parameters: [ {
        type: 'string',
        enum: [ 'keyDown', 'keyUp', 'rawKeyDown', 'char' ],
        description: 'Type of the key event.'
      },
      {
        type: 'integer',
        optional: true,
        description: 'Bit field representing pressed modifier keys. Alt=1, Ctrl=2, Meta/Command=4, Shift=8 (default: 0).'
      },
      {
        type: 'number',
        optional: true,
        description: 'Time at which the event occurred. Measured in UTC time in seconds since January 1, 1970 (default: current time).'
      },
      {
        type: 'string',
        optional: true,
        description: 'Text as generated by processing a virtual key code with a keyboard layout. Not needed for for <code>keyUp</code> and <code>rawKeyDown</code> events (default: "")'
      },
      {
        type: 'string',
        optional: true,
        description: 'Text that would have been generated by the keyboard if no modifiers were pressed (except for shift). Useful for shortcut (accelerator) key handling (default: "").'
      },
      {
        type: 'string',
        optional: true,
        description: 'Unique key identifier (e.g., \'U+0041\') (default: "").'
      },
      {
        type: 'string',
        optional: true,
        description: 'Unique DOM defined string value for each physical key (e.g., \'KeyA\') (default: "").'
      },
      {
        type: 'string',
        optional: true,
        description: 'Unique DOM defined string value describing the meaning of the key in the context of active modifiers, keyboard layout, etc (e.g., \'AltGr\') (default: "").'
      },
      {
        type: 'integer',
        optional: true,
        description: 'Windows virtual key code (default: 0).'
      },
      {
        type: 'integer',
        optional: true,
        description: 'Native virtual key code (default: 0).'
      },
      {
        type: 'boolean',
        optional: true,
        description: 'Whether the event was generated from auto repeat (default: false).'
      },
      {
        type: 'boolean',
        optional: true,
        description: 'Whether the event was generated from the keypad (default: false).'
      },
      {
        type: 'boolean',
        optional: true,
        description: 'Whether the event was a system key event (default: false).'
      } ],
      description: 'Dispatches a key event to the page.'
    },
    {
      name: 'dispatchMouseEvent',
      parameters: [ {
        type: 'string',
        enum: [ 'mousePressed', 'mouseReleased', 'mouseMoved' ],
        description: 'Type of the mouse event.'
      },
      {
        type: 'integer',
        description: 'X coordinate of the event relative to the main frame\'s viewport.'
      },
      {
        type: 'integer',
        description: 'Y coordinate of the event relative to the main frame\'s viewport. 0 refers to the top of the viewport and Y increases as it proceeds towards the bottom of the viewport.'
      },
      {
        type: 'integer',
        optional: true,
        description: 'Bit field representing pressed modifier keys. Alt=1, Ctrl=2, Meta/Command=4, Shift=8 (default: 0).'
      },
      {
        type: 'number',
        optional: true,
        description: 'Time at which the event occurred. Measured in UTC time in seconds since January 1, 1970 (default: current time).'
      },
      {
        type: 'string',
        enum: [ 'none', 'left', 'middle', 'right' ],
        optional: true,
        description: 'Mouse button (default: "none").'
      },
      {
        type: 'integer',
        optional: true,
        description: 'Number of times the mouse button was clicked (default: 0).'
      } ],
      description: 'Dispatches a mouse event to the page.'
    },
    {
      name: 'dispatchTouchEvent',
      experimental: true,
      parameters: [ {
        type: 'string',
        enum: [ 'touchStart', 'touchEnd', 'touchMove' ],
        description: 'Type of the touch event.'
      },
      {
        type: 'array',
        items: { '$ref': 'TouchPoint' },
        description: 'Touch points.'
      },
      {
        type: 'integer',
        optional: true,
        description: 'Bit field representing pressed modifier keys. Alt=1, Ctrl=2, Meta/Command=4, Shift=8 (default: 0).'
      },
      {
        type: 'number',
        optional: true,
        description: 'Time at which the event occurred. Measured in UTC time in seconds since January 1, 1970 (default: current time).'
      } ],
      description: 'Dispatches a touch event to the page.'
    },
    {
      name: 'emulateTouchFromMouseEvent',
      experimental: true,
      parameters: [ {
        type: 'string',
        enum: [ 'mousePressed', 'mouseReleased', 'mouseMoved', 'mouseWheel' ],
        description: 'Type of the mouse event.'
      },
      {
        type: 'integer',
        description: 'X coordinate of the mouse pointer in DIP.'
      },
      {
        type: 'integer',
        description: 'Y coordinate of the mouse pointer in DIP.'
      },
      {
        type: 'number',
        description: 'Time at which the event occurred. Measured in UTC time in seconds since January 1, 1970.'
      },
      {
        type: 'string',
        enum: [ 'none', 'left', 'middle', 'right' ],
        description: 'Mouse button.'
      },
      {
        type: 'number',
        optional: true,
        description: 'X delta in DIP for mouse wheel event (default: 0).'
      },
      {
        type: 'number',
        optional: true,
        description: 'Y delta in DIP for mouse wheel event (default: 0).'
      },
      {
        type: 'integer',
        optional: true,
        description: 'Bit field representing pressed modifier keys. Alt=1, Ctrl=2, Meta/Command=4, Shift=8 (default: 0).'
      },
      {
        type: 'integer',
        optional: true,
        description: 'Number of times the mouse button was clicked (default: 0).'
      } ],
      description: 'Emulates touch event from the mouse event parameters.'
    },
    {
      name: 'synthesizePinchGesture',
      parameters: [ {
        type: 'integer',
        description: 'X coordinate of the start of the gesture in CSS pixels.'
      },
      {
        type: 'integer',
        description: 'Y coordinate of the start of the gesture in CSS pixels.'
      },
      {
        type: 'number',
        description: 'Relative scale factor after zooming (>1.0 zooms in, <1.0 zooms out).'
      },
      {
        type: 'integer',
        optional: true,
        description: 'Relative pointer speed in pixels per second (default: 800).'
      },
      {
        '$ref': 'GestureSourceType',
        optional: true,
        description: 'Which type of input events to be generated (default: \'default\', which queries the platform for the preferred input type).'
      } ],
      description: 'Synthesizes a pinch gesture over a time period by issuing appropriate touch events.',
      experimental: true
    },
    {
      name: 'synthesizeScrollGesture',
      parameters: [ {
        type: 'integer',
        description: 'X coordinate of the start of the gesture in CSS pixels.'
      },
      {
        type: 'integer',
        description: 'Y coordinate of the start of the gesture in CSS pixels.'
      },
      {
        type: 'integer',
        optional: true,
        description: 'The distance to scroll along the X axis (positive to scroll left).'
      },
      {
        type: 'integer',
        optional: true,
        description: 'The distance to scroll along the Y axis (positive to scroll up).'
      },
      {
        type: 'integer',
        optional: true,
        description: 'The number of additional pixels to scroll back along the X axis, in addition to the given distance.'
      },
      {
        type: 'integer',
        optional: true,
        description: 'The number of additional pixels to scroll back along the Y axis, in addition to the given distance.'
      },
      {
        type: 'boolean',
        optional: true,
        description: 'Prevent fling (default: true).'
      },
      {
        type: 'integer',
        optional: true,
        description: 'Swipe speed in pixels per second (default: 800).'
      },
      {
        '$ref': 'GestureSourceType',
        optional: true,
        description: 'Which type of input events to be generated (default: \'default\', which queries the platform for the preferred input type).'
      },
      {
        type: 'integer',
        optional: true,
        description: 'The number of times to repeat the gesture (default: 0).'
      },
      {
        type: 'integer',
        optional: true,
        description: 'The number of milliseconds delay between each repeat. (default: 250).'
      },
      {
        type: 'string',
        optional: true,
        description: 'The name of the interaction markers to generate, if not empty (default: "").'
      } ],
      description: 'Synthesizes a scroll gesture over a time period by issuing appropriate touch events.',
      experimental: true
    },
    {
      name: 'synthesizeTapGesture',
      parameters: [ {
        type: 'integer',
        description: 'X coordinate of the start of the gesture in CSS pixels.'
      },
      {
        type: 'integer',
        description: 'Y coordinate of the start of the gesture in CSS pixels.'
      },
      {
        type: 'integer',
        optional: true,
        description: 'Duration between touchdown and touchup events in ms (default: 50).'
      },
      {
        type: 'integer',
        optional: true,
        description: 'Number of times to perform the tap (e.g. 2 for double tap, default: 1).'
      },
      {
        '$ref': 'GestureSourceType',
        optional: true,
        description: 'Which type of input events to be generated (default: \'default\', which queries the platform for the preferred input type).'
      } ],
      description: 'Synthesizes a tap gesture over a time period by issuing appropriate touch events.',
      experimental: true
    } ],
    events: []
  },
  LayerTree: {
    domain: 'LayerTree',
    experimental: true,
    dependencies: [ 'DOM' ],
    types: [ {
      id: 'LayerId',
      type: 'string',
      description: 'Unique Layer identifier.'
    },
    {
      id: 'SnapshotId',
      type: 'string',
      description: 'Unique snapshot identifier.'
    },
    {
      id: 'ScrollRect',
      type: 'object',
      description: 'Rectangle where scrolling happens on the main thread.',
      properties: [ { '$ref': 'DOM.Rect', description: 'Rectangle itself.' },
        {
          type: 'string',
          enum: [ 'RepaintsOnScroll', 'TouchEventHandler', 'WheelEventHandler' ],
          description: 'Reason for rectangle to force scrolling on the main thread'
        } ]
    },
    {
      id: 'PictureTile',
      type: 'object',
      description: 'Serialized fragment of layer picture along with its offset within the layer.',
      properties: [ {
        type: 'number',
        description: 'Offset from owning layer left boundary'
      },
      {
        type: 'number',
        description: 'Offset from owning layer top boundary'
      },
          { type: 'string', description: 'Base64-encoded snapshot data.' } ]
    },
    {
      id: 'Layer',
      type: 'object',
      description: 'Information about a compositing layer.',
      properties: [ {
        '$ref': 'LayerId',
        description: 'The unique id for this layer.'
      },
      {
        '$ref': 'LayerId',
        optional: true,
        description: 'The id of parent (not present for root).'
      },
      {
        '$ref': 'DOM.BackendNodeId',
        optional: true,
        description: 'The backend id for the node associated with this layer.'
      },
      {
        type: 'number',
        description: 'Offset from parent layer, X coordinate.'
      },
      {
        type: 'number',
        description: 'Offset from parent layer, Y coordinate.'
      },
          { type: 'number', description: 'Layer width.' },
          { type: 'number', description: 'Layer height.' },
      {
        type: 'array',
        items: { type: 'number' },
        minItems: 16,
        maxItems: 16,
        optional: true,
        description: 'Transformation matrix for layer, default is identity matrix'
      },
      {
        type: 'number',
        optional: true,
        description: 'Transform anchor point X, absent if no transform specified'
      },
      {
        type: 'number',
        optional: true,
        description: 'Transform anchor point Y, absent if no transform specified'
      },
      {
        type: 'number',
        optional: true,
        description: 'Transform anchor point Z, absent if no transform specified'
      },
      {
        type: 'integer',
        description: 'Indicates how many time this layer has painted.'
      },
      {
        type: 'boolean',
        description: 'Indicates whether this layer hosts any content, rather than being used for transform/scrolling purposes only.'
      },
      {
        type: 'boolean',
        optional: true,
        description: 'Set if layer is not visible.'
      },
      {
        type: 'array',
        items: { '$ref': 'ScrollRect' },
        optional: true,
        description: 'Rectangles scrolling on main thread only.'
      } ]
    },
    {
      id: 'PaintProfile',
      type: 'array',
      description: 'Array of timings, one per paint step.',
      items: {
        type: 'number',
        description: 'A time in seconds since the end of previous step (for the first step, time since painting started)'
      }
    } ],
    commands: [ {
      name: 'enable',
      description: 'Enables compositing tree inspection.'
    },
    {
      name: 'disable',
      description: 'Disables compositing tree inspection.'
    },
    {
      name: 'compositingReasons',
      parameters: [ {
        '$ref': 'LayerId',
        description: 'The id of the layer for which we want to get the reasons it was composited.'
      } ],
      description: 'Provides the reasons why the given layer was composited.',
      returns: [ {
        name: 'compositingReasons',
        type: 'array',
        items: { type: 'string' },
        description: 'A list of strings specifying reasons for the given layer to become composited.'
      } ]
    },
    {
      name: 'makeSnapshot',
      parameters: [ { '$ref': 'LayerId', description: 'The id of the layer.' } ],
      description: 'Returns the layer snapshot identifier.',
      returns: [ {
        name: 'snapshotId',
        '$ref': 'SnapshotId',
        description: 'The id of the layer snapshot.'
      } ]
    },
    {
      name: 'loadSnapshot',
      parameters: [ {
        type: 'array',
        items: { '$ref': 'PictureTile' },
        minItems: 1,
        description: 'An array of tiles composing the snapshot.'
      } ],
      description: 'Returns the snapshot identifier.',
      returns: [ {
        name: 'snapshotId',
        '$ref': 'SnapshotId',
        description: 'The id of the snapshot.'
      } ]
    },
    {
      name: 'releaseSnapshot',
      parameters: [ {
        '$ref': 'SnapshotId',
        description: 'The id of the layer snapshot.'
      } ],
      description: 'Releases layer snapshot captured by the back-end.'
    },
    {
      name: 'profileSnapshot',
      parameters: [ {
        '$ref': 'SnapshotId',
        description: 'The id of the layer snapshot.'
      },
      {
        type: 'integer',
        optional: true,
        description: 'The maximum number of times to replay the snapshot (1, if not specified).'
      },
      {
        type: 'number',
        optional: true,
        description: 'The minimum duration (in seconds) to replay the snapshot.'
      },
      {
        '$ref': 'DOM.Rect',
        optional: true,
        description: 'The clip rectangle to apply when replaying the snapshot.'
      } ],
      returns: [ {
        name: 'timings',
        type: 'array',
        items: { '$ref': 'PaintProfile' },
        description: 'The array of paint profiles, one per run.'
      } ]
    },
    {
      name: 'replaySnapshot',
      parameters: [ {
        '$ref': 'SnapshotId',
        description: 'The id of the layer snapshot.'
      },
      {
        type: 'integer',
        optional: true,
        description: 'The first step to replay from (replay from the very start if not specified).'
      },
      {
        type: 'integer',
        optional: true,
        description: 'The last step to replay to (replay till the end if not specified).'
      },
      {
        type: 'number',
        optional: true,
        description: 'The scale to apply while replaying (defaults to 1).'
      } ],
      description: 'Replays the layer snapshot and returns the resulting bitmap.',
      returns: [ {
        name: 'dataURL',
        type: 'string',
        description: 'A data: URL for resulting image.'
      } ]
    },
    {
      name: 'snapshotCommandLog',
      parameters: [ {
        '$ref': 'SnapshotId',
        description: 'The id of the layer snapshot.'
      } ],
      description: 'Replays the layer snapshot and returns canvas log.',
      returns: [ {
        name: 'commandLog',
        type: 'array',
        items: { type: 'object' },
        description: 'The array of canvas function calls.'
      } ]
    } ],
    events: [ {
      name: 'layerTreeDidChange',
      parameters: [ {
        type: 'array',
        items: { '$ref': 'Layer' },
        optional: true,
        description: 'Layer tree, absent if not in the comspositing mode.'
      } ]
    },
    {
      name: 'layerPainted',
      parameters: [ {
        '$ref': 'LayerId',
        description: 'The id of the painted layer.'
      },
          { '$ref': 'DOM.Rect', description: 'Clip rectangle.' } ]
    } ]
  },
  DeviceOrientation: {
    domain: 'DeviceOrientation',
    experimental: true,
    commands: [ {
      name: 'setDeviceOrientationOverride',
      description: 'Overrides the Device Orientation.',
      parameters: [ { type: 'number', description: 'Mock alpha' },
        { type: 'number', description: 'Mock beta' },
        { type: 'number', description: 'Mock gamma' } ]
    },
    {
      name: 'clearDeviceOrientationOverride',
      description: 'Clears the overridden Device Orientation.'
    } ]
  },
  Tracing: {
    domain: 'Tracing',
    dependencies: [ 'IO' ],
    experimental: true,
    types: [ {
      id: 'MemoryDumpConfig',
      type: 'object',
      description: 'Configuration for memory dump. Used only when "memory-infra" category is enabled.'
    },
    {
      id: 'TraceConfig',
      type: 'object',
      properties: [ {
        type: 'string',
        optional: true,
        enum: [ 'recordUntilFull',
          'recordContinuously',
          'recordAsMuchAsPossible',
          'echoToConsole' ],
        description: 'Controls how the trace buffer stores data.'
      },
      {
        type: 'boolean',
        optional: true,
        description: 'Turns on JavaScript stack sampling.'
      },
      {
        type: 'boolean',
        optional: true,
        description: 'Turns on system tracing.'
      },
      {
        type: 'boolean',
        optional: true,
        description: 'Turns on argument filter.'
      },
      {
        type: 'array',
        items: { type: 'string' },
        optional: true,
        description: 'Included category filters.'
      },
      {
        type: 'array',
        items: { type: 'string' },
        optional: true,
        description: 'Excluded category filters.'
      },
      {
        type: 'array',
        items: { type: 'string' },
        optional: true,
        description: 'Configuration to synthesize the delays in tracing.'
      },
      {
        '$ref': 'MemoryDumpConfig',
        optional: true,
        description: 'Configuration for memory dump triggers. Used only when "memory-infra" category is enabled.'
      } ]
    } ],
    commands: [ {
      name: 'start',
      description: 'Start trace events collection.',
      parameters: [ {
        type: 'string',
        optional: true,
        deprecated: true,
        description: 'Category/tag filter'
      },
      {
        type: 'string',
        optional: true,
        deprecated: true,
        description: 'Tracing options'
      },
      {
        type: 'number',
        optional: true,
        description: 'If set, the agent will issue bufferUsage events at this interval, specified in milliseconds'
      },
      {
        type: 'string',
        enum: [ 'ReportEvents', 'ReturnAsStream' ],
        optional: true,
        description: 'Whether to report trace events as series of dataCollected events or to save trace to a stream (defaults to <code>ReportEvents</code>).'
      },
        { '$ref': 'TraceConfig', optional: true, description: '' } ]
    },
      { name: 'end', description: 'Stop trace events collection.' },
    {
      name: 'getCategories',
      description: 'Gets supported tracing categories.',
      returns: [ {
        name: 'categories',
        type: 'array',
        items: { type: 'string' },
        description: 'A list of supported tracing categories.'
      } ]
    },
    {
      name: 'requestMemoryDump',
      description: 'Request a global memory dump.',
      returns: [ {
        name: 'dumpGuid',
        type: 'string',
        description: 'GUID of the resulting global memory dump.'
      },
      {
        name: 'success',
        type: 'boolean',
        description: 'True iff the global memory dump succeeded.'
      } ]
    },
    {
      name: 'recordClockSyncMarker',
      description: 'Record a clock sync marker in the trace.',
      parameters: [ {
        type: 'string',
        description: 'The ID of this clock sync marker'
      } ]
    } ],
    events: [ {
      name: 'dataCollected',
      parameters: [ { type: 'array', items: { type: 'object' } } ],
      description: 'Contains an bucket of collected trace events. When tracing is stopped collected events will be send as a sequence of dataCollected events followed by tracingComplete event.'
    },
    {
      name: 'tracingComplete',
      description: 'Signals that tracing is stopped and there is no trace buffers pending flush, all data were delivered via dataCollected events.',
      parameters: [ {
        '$ref': 'IO.StreamHandle',
        optional: true,
        description: 'A handle of the stream that holds resulting trace data.'
      } ]
    },
    {
      name: 'bufferUsage',
      parameters: [ {
        type: 'number',
        optional: true,
        description: 'A number in range [0..1] that indicates the used size of event buffer as a fraction of its total size.'
      },
      {
        type: 'number',
        optional: true,
        description: 'An approximate number of events in the trace log.'
      },
      {
        type: 'number',
        optional: true,
        description: 'A number in range [0..1] that indicates the used size of event buffer as a fraction of its total size.'
      } ]
    } ]
  },
  Animation: {
    domain: 'Animation',
    experimental: true,
    dependencies: [ 'Runtime', 'DOM' ],
    types: [ {
      id: 'Animation',
      type: 'object',
      experimental: true,
      properties: [ { type: 'string', description: '<code>Animation</code>\'s id.' },
        {
          type: 'string',
          description: '<code>Animation</code>\'s name.'
        },
        {
          type: 'boolean',
          experimental: true,
          description: '<code>Animation</code>\'s internal paused state.'
        },
        {
          type: 'string',
          description: '<code>Animation</code>\'s play state.'
        },
        {
          type: 'number',
          description: '<code>Animation</code>\'s playback rate.'
        },
        {
          type: 'number',
          description: '<code>Animation</code>\'s start time.'
        },
        {
          type: 'number',
          description: '<code>Animation</code>\'s current time.'
        },
        {
          '$ref': 'AnimationEffect',
          description: '<code>Animation</code>\'s source animation node.'
        },
        {
          type: 'string',
          enum: [ 'CSSTransition', 'CSSAnimation', 'WebAnimation' ],
          description: 'Animation type of <code>Animation</code>.'
        },
        {
          type: 'string',
          optional: true,
          description: 'A unique ID for <code>Animation</code> representing the sources that triggered this CSS animation/transition.'
        } ],
      description: 'Animation instance.'
    },
    {
      id: 'AnimationEffect',
      type: 'object',
      experimental: true,
      properties: [ {
        type: 'number',
        description: '<code>AnimationEffect</code>\'s delay.'
      },
      {
        type: 'number',
        description: '<code>AnimationEffect</code>\'s end delay.'
      },
      {
        type: 'number',
        description: '<code>AnimationEffect</code>\'s iteration start.'
      },
      {
        type: 'number',
        description: '<code>AnimationEffect</code>\'s iterations.'
      },
      {
        type: 'number',
        description: '<code>AnimationEffect</code>\'s iteration duration.'
      },
      {
        type: 'string',
        description: '<code>AnimationEffect</code>\'s playback direction.'
      },
      {
        type: 'string',
        description: '<code>AnimationEffect</code>\'s fill mode.'
      },
      {
        '$ref': 'DOM.BackendNodeId',
        description: '<code>AnimationEffect</code>\'s target node.'
      },
      {
        '$ref': 'KeyframesRule',
        optional: true,
        description: '<code>AnimationEffect</code>\'s keyframes.'
      },
      {
        type: 'string',
        description: '<code>AnimationEffect</code>\'s timing function.'
      } ],
      description: 'AnimationEffect instance'
    },
    {
      id: 'KeyframesRule',
      type: 'object',
      properties: [ {
        type: 'string',
        optional: true,
        description: 'CSS keyframed animation\'s name.'
      },
      {
        type: 'array',
        items: { '$ref': 'KeyframeStyle' },
        description: 'List of animation keyframes.'
      } ],
      description: 'Keyframes Rule'
    },
    {
      id: 'KeyframeStyle',
      type: 'object',
      properties: [ { type: 'string', description: 'Keyframe\'s time offset.' },
        {
          type: 'string',
          description: '<code>AnimationEffect</code>\'s timing function.'
        } ],
      description: 'Keyframe Style'
    } ],
    commands: [ {
      name: 'enable',
      description: 'Enables animation domain notifications.'
    },
    {
      name: 'disable',
      description: 'Disables animation domain notifications.'
    },
    {
      name: 'getPlaybackRate',
      returns: [ {
        name: 'playbackRate',
        type: 'number',
        description: 'Playback rate for animations on page.'
      } ],
      description: 'Gets the playback rate of the document timeline.'
    },
    {
      name: 'setPlaybackRate',
      parameters: [ {
        type: 'number',
        description: 'Playback rate for animations on page'
      } ],
      description: 'Sets the playback rate of the document timeline.'
    },
    {
      name: 'getCurrentTime',
      parameters: [ { type: 'string', description: 'Id of animation.' } ],
      returns: [ {
        name: 'currentTime',
        type: 'number',
        description: 'Current time of the page.'
      } ],
      description: 'Returns the current time of the an animation.'
    },
    {
      name: 'setPaused',
      parameters: [ {
        type: 'array',
        items: { type: 'string' },
        description: 'Animations to set the pause state of.'
      },
          { type: 'boolean', description: 'Paused state to set to.' } ],
      description: 'Sets the paused state of a set of animations.'
    },
    {
      name: 'setTiming',
      parameters: [ { type: 'string', description: 'Animation id.' },
          { type: 'number', description: 'Duration of the animation.' },
          { type: 'number', description: 'Delay of the animation.' } ],
      description: 'Sets the timing of an animation node.'
    },
    {
      name: 'seekAnimations',
      parameters: [ {
        type: 'array',
        items: { type: 'string' },
        description: 'List of animation ids to seek.'
      },
      {
        type: 'number',
        description: 'Set the current time of each animation.'
      } ],
      description: 'Seek a set of animations to a particular time within each animation.'
    },
    {
      name: 'releaseAnimations',
      parameters: [ {
        type: 'array',
        items: { type: 'string' },
        description: 'List of animation ids to seek.'
      } ],
      description: 'Releases a set of animations to no longer be manipulated.'
    },
    {
      name: 'resolveAnimation',
      parameters: [ { type: 'string', description: 'Animation id.' } ],
      returns: [ {
        name: 'remoteObject',
        '$ref': 'Runtime.RemoteObject',
        description: 'Corresponding remote object.'
      } ],
      description: 'Gets the remote object of the Animation.'
    } ],
    events: [ {
      name: 'animationCreated',
      parameters: [ {
        type: 'string',
        description: 'Id of the animation that was created.'
      } ],
      description: 'Event for each animation that has been created.'
    },
    {
      name: 'animationStarted',
      parameters: [ {
        '$ref': 'Animation',
        description: 'Animation that was started.'
      } ],
      description: 'Event for animation that has been started.'
    },
    {
      name: 'animationCanceled',
      parameters: [ {
        type: 'string',
        description: 'Id of the animation that was cancelled.'
      } ],
      description: 'Event for when an animation has been cancelled.'
    } ]
  },
  Accessibility: {
    domain: 'Accessibility',
    experimental: true,
    dependencies: [ 'DOM' ],
    types: [ {
      id: 'AXNodeId',
      type: 'string',
      description: 'Unique accessibility node identifier.'
    },
    {
      id: 'AXValueType',
      type: 'string',
      enum: [ 'boolean',
        'tristate',
        'booleanOrUndefined',
        'idref',
        'idrefList',
        'integer',
        'node',
        'nodeList',
        'number',
        'string',
        'computedString',
        'token',
        'tokenList',
        'domRelation',
        'role',
        'internalRole',
        'valueUndefined' ],
      description: 'Enum of possible property types.'
    },
    {
      id: 'AXValueSourceType',
      type: 'string',
      enum: [ 'attribute',
        'implicit',
        'style',
        'contents',
        'placeholder',
        'relatedElement' ],
      description: 'Enum of possible property sources.'
    },
    {
      id: 'AXValueNativeSourceType',
      type: 'string',
      enum: [ 'figcaption',
        'label',
        'labelfor',
        'labelwrapped',
        'legend',
        'tablecaption',
        'title',
        'other' ],
      description: 'Enum of possible native property sources (as a subtype of a particular AXValueSourceType).'
    },
    {
      id: 'AXValueSource',
      type: 'object',
      properties: [ {
        '$ref': 'AXValueSourceType',
        description: 'What type of source this is.'
      },
      {
        '$ref': 'AXValue',
        description: 'The value of this property source.',
        optional: true
      },
      {
        type: 'string',
        description: 'The name of the relevant attribute, if any.',
        optional: true
      },
      {
        '$ref': 'AXValue',
        description: 'The value of the relevant attribute, if any.',
        optional: true
      },
      {
        type: 'boolean',
        description: 'Whether this source is superseded by a higher priority source.',
        optional: true
      },
      {
        '$ref': 'AXValueNativeSourceType',
        description: 'The native markup source for this value, e.g. a <label> element.',
        optional: true
      },
      {
        '$ref': 'AXValue',
        description: 'The value, such as a node or node list, of the native source.',
        optional: true
      },
      {
        type: 'boolean',
        description: 'Whether the value for this property is invalid.',
        optional: true
      },
      {
        type: 'string',
        description: 'Reason for the value being invalid, if it is.',
        optional: true
      } ],
      description: 'A single source for a computed AX property.'
    },
    {
      id: 'AXRelatedNode',
      type: 'object',
      properties: [ {
        '$ref': 'DOM.BackendNodeId',
        description: 'The BackendNodeId of the related DOM node.'
      },
      {
        type: 'string',
        description: 'The IDRef value provided, if any.',
        optional: true
      },
      {
        type: 'string',
        description: 'The text alternative of this node in the current context.',
        optional: true
      } ]
    },
    {
      id: 'AXProperty',
      type: 'object',
      properties: [ { type: 'string', description: 'The name of this property.' },
        {
          '$ref': 'AXValue',
          description: 'The value of this property.'
        } ]
    },
    {
      id: 'AXValue',
      type: 'object',
      properties: [ {
        '$ref': 'AXValueType',
        description: 'The type of this value.'
      },
      {
        type: 'any',
        description: 'The computed value of this property.',
        optional: true
      },
      {
        type: 'array',
        items: { '$ref': 'AXRelatedNode' },
        description: 'One or more related nodes, if applicable.',
        optional: true
      },
      {
        type: 'array',
        items: { '$ref': 'AXValueSource' },
        description: 'The sources which contributed to the computation of this property.',
        optional: true
      } ],
      description: 'A single computed AX property.'
    },
    {
      id: 'AXGlobalStates',
      type: 'string',
      enum: [ 'disabled',
        'hidden',
        'hiddenRoot',
        'invalid',
        'keyshortcuts',
        'roledescription' ],
      description: 'States which apply to every AX node.'
    },
    {
      id: 'AXLiveRegionAttributes',
      type: 'string',
      enum: [ 'live', 'atomic', 'relevant', 'busy', 'root' ],
      description: 'Attributes which apply to nodes in live regions.'
    },
    {
      id: 'AXWidgetAttributes',
      type: 'string',
      enum: [ 'autocomplete',
        'haspopup',
        'level',
        'multiselectable',
        'orientation',
        'multiline',
        'readonly',
        'required',
        'valuemin',
        'valuemax',
        'valuetext' ],
      description: 'Attributes which apply to widgets.'
    },
    {
      id: 'AXWidgetStates',
      type: 'string',
      enum: [ 'checked', 'expanded', 'modal', 'pressed', 'selected' ],
      description: 'States which apply to widgets.'
    },
    {
      id: 'AXRelationshipAttributes',
      type: 'string',
      enum: [ 'activedescendant',
        'controls',
        'describedby',
        'details',
        'errormessage',
        'flowto',
        'labelledby',
        'owns' ],
      description: 'Relationships between elements other than parent/child/sibling.'
    },
    {
      id: 'AXNode',
      type: 'object',
      properties: [ {
        '$ref': 'AXNodeId',
        description: 'Unique identifier for this node.'
      },
      {
        type: 'boolean',
        description: 'Whether this node is ignored for accessibility'
      },
      {
        type: 'array',
        items: { '$ref': 'AXProperty' },
        description: 'Collection of reasons why this node is hidden.',
        optional: true
      },
      {
        '$ref': 'AXValue',
        description: 'This <code>Node</code>\'s role, whether explicit or implicit.',
        optional: true
      },
      {
        '$ref': 'AXValue',
        description: 'The accessible name for this <code>Node</code>.',
        optional: true
      },
      {
        '$ref': 'AXValue',
        description: 'The accessible description for this <code>Node</code>.',
        optional: true
      },
      {
        '$ref': 'AXValue',
        description: 'The value for this <code>Node</code>.',
        optional: true
      },
      {
        type: 'array',
        items: { '$ref': 'AXProperty' },
        description: 'All other properties',
        optional: true
      },
      {
        type: 'array',
        items: { '$ref': 'AXNodeId' },
        description: 'IDs for each of this node\'s child nodes.',
        optional: true
      },
      {
        '$ref': 'DOM.BackendNodeId',
        description: 'The backend ID for the associated DOM node, if any.',
        optional: true
      } ],
      description: 'A node in the accessibility tree.'
    } ],
    commands: [ {
      name: 'getPartialAXTree',
      parameters: [ {
        '$ref': 'DOM.NodeId',
        description: 'ID of node to get the partial accessibility tree for.'
      },
      {
        type: 'boolean',
        description: 'Whether to fetch this nodes ancestors, siblings and children. Defaults to true.',
        optional: true
      } ],
      returns: [ {
        name: 'nodes',
        type: 'array',
        items: { '$ref': 'AXNode' },
        description: 'The <code>Accessibility.AXNode</code> for this DOM node, if it exists, plus its ancestors, siblings and children, if requested.'
      } ],
      description: 'Fetches the accessibility node and partial accessibility tree for this DOM node, if it exists.',
      experimental: true
    } ]
  },
  Storage: {
    domain: 'Storage',
    experimental: true,
    types: [ {
      id: 'StorageType',
      type: 'string',
      enum: [ 'appcache',
        'cookies',
        'file_systems',
        'indexeddb',
        'local_storage',
        'shader_cache',
        'websql',
        'service_workers',
        'cache_storage',
        'all' ],
      description: 'Enum of possible storage types.'
    } ],
    commands: [ {
      name: 'clearDataForOrigin',
      parameters: [ { type: 'string', description: 'Security origin.' },
        { type: 'string', description: 'Comma separated origin names.' } ],
      description: 'Clears storage for origin.'
    } ]
  },
  Log: {
    domain: 'Log',
    description: 'Provides access to log entries.',
    dependencies: [ 'Runtime', 'Network' ],
    experimental: true,
    types: [ {
      id: 'LogEntry',
      type: 'object',
      description: 'Log entry.',
      properties: [ {
        type: 'string',
        enum: [ 'xml',
          'javascript',
          'network',
          'storage',
          'appcache',
          'rendering',
          'security',
          'deprecation',
          'worker',
          'violation',
          'intervention',
          'other' ],
        description: 'Log entry source.'
      },
      {
        type: 'string',
        enum: [ 'verbose', 'info', 'warning', 'error' ],
        description: 'Log entry severity.'
      },
        { type: 'string', description: 'Logged text.' },
      {
        '$ref': 'Runtime.Timestamp',
        description: 'Timestamp when this entry was added.'
      },
      {
        type: 'string',
        optional: true,
        description: 'URL of the resource if known.'
      },
      {
        type: 'integer',
        optional: true,
        description: 'Line number in the resource.'
      },
      {
        '$ref': 'Runtime.StackTrace',
        optional: true,
        description: 'JavaScript stack trace.'
      },
      {
        '$ref': 'Network.RequestId',
        optional: true,
        description: 'Identifier of the network request associated with this entry.'
      },
      {
        type: 'string',
        optional: true,
        description: 'Identifier of the worker associated with this entry.'
      } ]
    },
    {
      id: 'ViolationSetting',
      type: 'object',
      description: 'Violation configuration setting.',
      properties: [ {
        type: 'string',
        enum: [ 'longTask',
          'longLayout',
          'blockedEvent',
          'blockedParser',
          'discouragedAPIUse',
          'handler',
          'recurringHandler' ],
        description: 'Violation type.'
      },
      {
        type: 'number',
        description: 'Time threshold to trigger upon.'
      } ]
    } ],
    commands: [ {
      name: 'enable',
      description: 'Enables log domain, sends the entries collected so far to the client by means of the <code>entryAdded</code> notification.'
    },
    {
      name: 'disable',
      description: 'Disables log domain, prevents further log entries from being reported to the client.'
    },
      { name: 'clear', description: 'Clears the log.' },
    {
      name: 'startViolationsReport',
      parameters: [ {
        type: 'array',
        items: { '$ref': 'ViolationSetting' },
        description: 'Configuration for violations.'
      } ],
      description: 'start violation reporting.'
    },
    {
      name: 'stopViolationsReport',
      description: 'Stop violation reporting.'
    } ],
    events: [ {
      name: 'entryAdded',
      parameters: [ { '$ref': 'LogEntry', description: 'The entry.' } ],
      description: 'Issued when new message was logged.'
    } ]
  },
  SystemInfo: {
    domain: 'SystemInfo',
    description: 'The SystemInfo domain defines methods and events for querying low-level system information.',
    experimental: true,
    types: [ {
      id: 'GPUDevice',
      type: 'object',
      properties: [ {
        type: 'number',
        description: 'PCI ID of the GPU vendor, if available; 0 otherwise.'
      },
      {
        type: 'number',
        description: 'PCI ID of the GPU device, if available; 0 otherwise.'
      },
      {
        type: 'string',
        description: 'String description of the GPU vendor, if the PCI ID is not available.'
      },
      {
        type: 'string',
        description: 'String description of the GPU device, if the PCI ID is not available.'
      } ],
      description: 'Describes a single graphics processor (GPU).'
    },
    {
      id: 'GPUInfo',
      type: 'object',
      properties: [ {
        type: 'array',
        items: { '$ref': 'GPUDevice' },
        description: 'The graphics devices on the system. Element 0 is the primary GPU.'
      },
      {
        type: 'object',
        optional: true,
        description: 'An optional dictionary of additional GPU related attributes.'
      },
      {
        type: 'object',
        optional: true,
        description: 'An optional dictionary of graphics features and their status.'
      },
      {
        type: 'array',
        items: { type: 'string' },
        description: 'An optional array of GPU driver bug workarounds.'
      } ],
      description: 'Provides information about the GPU(s) on the system.'
    } ],
    commands: [ {
      name: 'getInfo',
      description: 'Returns information about the system.',
      returns: [ {
        name: 'gpu',
        '$ref': 'GPUInfo',
        description: 'Information about the GPUs on the system.'
      },
      {
        name: 'modelName',
        type: 'string',
        description: 'A platform-dependent description of the model of the machine. On Mac OS, this is, for example, \'MacBookPro\'. Will be the empty string if not supported.'
      },
      {
        name: 'modelVersion',
        type: 'string',
        description: 'A platform-dependent description of the version of the machine. On Mac OS, this is, for example, \'10.1\'. Will be the empty string if not supported.'
      } ]
    } ]
  },
  Tethering: {
    domain: 'Tethering',
    description: 'The Tethering domain defines methods and events for browser port binding.',
    experimental: true,
    commands: [ {
      name: 'bind',
      description: 'Request browser port binding.',
      parameters: [ { type: 'integer', description: 'Port number to bind.' } ]
    },
    {
      name: 'unbind',
      description: 'Request browser port unbinding.',
      parameters: [ { type: 'integer', description: 'Port number to unbind.' } ]
    } ],
    events: [ {
      name: 'accepted',
      description: 'Informs that port was successfully bound and got a specified connection id.',
      parameters: [ {
        type: 'integer',
        description: 'Port number that was successfully bound.'
      },
        { type: 'string', description: 'Connection id to be used.' } ]
    } ]
  },
  Browser: {
    domain: 'Browser',
    description: 'The Browser domain defines methods and events for browser managing.',
    experimental: true,
    types: [ { id: 'WindowID', type: 'integer' },
      {
        id: 'WindowState',
        type: 'string',
        enum: [ 'normal', 'minimized', 'maximized', 'fullscreen' ],
        description: 'The state of the browser window.'
      },
      {
        id: 'Bounds',
        type: 'object',
        description: 'Browser window bounds information',
        properties: [ {
          type: 'integer',
          optional: true,
          description: 'The offset from the left edge of the screen to the window in pixels.'
        },
        {
          type: 'integer',
          optional: true,
          description: 'The offset from the top edge of the screen to the window in pixels.'
        },
        {
          type: 'integer',
          optional: true,
          description: 'The window width in pixels.'
        },
        {
          type: 'integer',
          optional: true,
          description: 'The window height in pixels.'
        },
        {
          '$ref': 'WindowState',
          optional: true,
          description: 'The window state. Default to normal.'
        } ]
      } ],
    commands: [ {
      name: 'getWindowForTarget',
      description: 'Get the browser window that contains the devtools target.',
      parameters: [ {
        '$ref': 'Target.TargetID',
        description: 'Devtools agent host id.'
      } ],
      returns: [ {
        name: 'windowId',
        '$ref': 'WindowID',
        description: 'Browser window id.'
      },
      {
        name: 'bounds',
        '$ref': 'Bounds',
        description: 'Bounds information of the window. When window state is \'minimized\', the restored window position and size are returned.'
      } ]
    },
    {
      name: 'setWindowBounds',
      description: 'Set position and/or size of the browser window.',
      parameters: [ { '$ref': 'WindowID', description: 'Browser window id.' },
        {
          '$ref': 'Bounds',
          description: 'New window bounds. The \'minimized\', \'maximized\' and \'fullscreen\' states cannot be combined with \'left\', \'top\', \'width\' or \'height\'. Leaves unspecified fields unchanged.'
        } ]
    },
    {
      name: 'getWindowBounds',
      description: 'Get position and size of the browser window.',
      parameters: [ { '$ref': 'WindowID', description: 'Browser window id.' } ],
      returns: [ {
        name: 'bounds',
        '$ref': 'Bounds',
        description: 'Bounds information of the window. When window state is \'minimized\', the restored window position and size are returned.'
      } ]
    } ]
  },
  Schema: {
    domain: 'Schema',
    description: 'Provides information about the protocol schema.',
    types: [ {
      id: 'Domain',
      type: 'object',
      description: 'Description of the protocol domain.',
      properties: [ { type: 'string', description: 'Domain name.' },
        { type: 'string', description: 'Domain version.' } ]
    } ],
    commands: [ {
      name: 'getDomains',
      description: 'Returns supported domains.',
      handlers: [ 'browser', 'renderer' ],
      returns: [ {
        name: 'domains',
        type: 'array',
        items: { '$ref': 'Domain' },
        description: 'List of supported domains.'
      } ]
    } ]
  },
  Runtime: {
    domain: 'Runtime',
    description: 'Runtime domain exposes JavaScript runtime by means of remote evaluation and mirror objects. Evaluation results are returned as mirror object that expose object type, string representation and unique identifier that can be used for further object reference. Original objects are maintained in memory unless they are either explicitly released or are released along with the other objects in their object group.',
    types: [ {
      id: 'ScriptId',
      type: 'string',
      description: 'Unique script identifier.'
    },
    {
      id: 'RemoteObjectId',
      type: 'string',
      description: 'Unique object identifier.'
    },
    {
      id: 'UnserializableValue',
      type: 'string',
      enum: [ 'Infinity', 'NaN', '-Infinity', '-0' ],
      description: 'Primitive value which cannot be JSON-stringified.'
    },
    {
      id: 'RemoteObject',
      type: 'object',
      description: 'Mirror object referencing original JavaScript object.',
      properties: [ {
        type: 'string',
        enum: [ 'object',
          'function',
          'undefined',
          'string',
          'number',
          'boolean',
          'symbol' ],
        description: 'Object type.'
      },
      {
        type: 'string',
        optional: true,
        enum: [ 'array',
          'null',
          'node',
          'regexp',
          'date',
          'map',
          'set',
          'weakmap',
          'weakset',
          'iterator',
          'generator',
          'error',
          'proxy',
          'promise',
          'typedarray' ],
        description: 'Object subtype hint. Specified for <code>object</code> type values only.'
      },
      {
        type: 'string',
        optional: true,
        description: 'Object class (constructor) name. Specified for <code>object</code> type values only.'
      },
      {
        type: 'any',
        optional: true,
        description: 'Remote object value in case of primitive values or JSON values (if it was requested).'
      },
      {
        '$ref': 'UnserializableValue',
        optional: true,
        description: 'Primitive value which can not be JSON-stringified does not have <code>value</code>, but gets this property.'
      },
      {
        type: 'string',
        optional: true,
        description: 'String representation of the object.'
      },
      {
        '$ref': 'RemoteObjectId',
        optional: true,
        description: 'Unique object identifier (for non-primitive values).'
      },
      {
        '$ref': 'ObjectPreview',
        optional: true,
        description: 'Preview containing abbreviated property values. Specified for <code>object</code> type values only.',
        experimental: true
      },
          { '$ref': 'CustomPreview', optional: true, experimental: true } ]
    },
    {
      id: 'CustomPreview',
      type: 'object',
      experimental: true,
      properties: [ { type: 'string' },
          { type: 'boolean' },
          { '$ref': 'RemoteObjectId' },
          { '$ref': 'RemoteObjectId' },
          { '$ref': 'RemoteObjectId', optional: true } ]
    },
    {
      id: 'ObjectPreview',
      type: 'object',
      experimental: true,
      description: 'Object containing abbreviated remote object value.',
      properties: [ {
        type: 'string',
        enum: [ 'object',
          'function',
          'undefined',
          'string',
          'number',
          'boolean',
          'symbol' ],
        description: 'Object type.'
      },
      {
        type: 'string',
        optional: true,
        enum: [ 'array',
          'null',
          'node',
          'regexp',
          'date',
          'map',
          'set',
          'weakmap',
          'weakset',
          'iterator',
          'generator',
          'error' ],
        description: 'Object subtype hint. Specified for <code>object</code> type values only.'
      },
      {
        type: 'string',
        optional: true,
        description: 'String representation of the object.'
      },
      {
        type: 'boolean',
        description: 'True iff some of the properties or entries of the original object did not fit.'
      },
      {
        type: 'array',
        items: { '$ref': 'PropertyPreview' },
        description: 'List of the properties.'
      },
      {
        type: 'array',
        items: { '$ref': 'EntryPreview' },
        optional: true,
        description: 'List of the entries. Specified for <code>map</code> and <code>set</code> subtype values only.'
      } ]
    },
    {
      id: 'PropertyPreview',
      type: 'object',
      experimental: true,
      properties: [ { type: 'string', description: 'Property name.' },
        {
          type: 'string',
          enum: [ 'object',
            'function',
            'undefined',
            'string',
            'number',
            'boolean',
            'symbol',
            'accessor' ],
          description: 'Object type. Accessor means that the property itself is an accessor property.'
        },
        {
          type: 'string',
          optional: true,
          description: 'User-friendly property value string.'
        },
        {
          '$ref': 'ObjectPreview',
          optional: true,
          description: 'Nested value preview.'
        },
        {
          type: 'string',
          optional: true,
          enum: [ 'array',
            'null',
            'node',
            'regexp',
            'date',
            'map',
            'set',
            'weakmap',
            'weakset',
            'iterator',
            'generator',
            'error' ],
          description: 'Object subtype hint. Specified for <code>object</code> type values only.'
        } ]
    },
    {
      id: 'EntryPreview',
      type: 'object',
      experimental: true,
      properties: [ {
        '$ref': 'ObjectPreview',
        optional: true,
        description: 'Preview of the key. Specified for map-like collection entries.'
      },
      {
        '$ref': 'ObjectPreview',
        description: 'Preview of the value.'
      } ]
    },
    {
      id: 'PropertyDescriptor',
      type: 'object',
      description: 'Object property descriptor.',
      properties: [ {
        type: 'string',
        description: 'Property name or symbol description.'
      },
      {
        '$ref': 'RemoteObject',
        optional: true,
        description: 'The value associated with the property.'
      },
      {
        type: 'boolean',
        optional: true,
        description: 'True if the value associated with the property may be changed (data descriptors only).'
      },
      {
        '$ref': 'RemoteObject',
        optional: true,
        description: 'A function which serves as a getter for the property, or <code>undefined</code> if there is no getter (accessor descriptors only).'
      },
      {
        '$ref': 'RemoteObject',
        optional: true,
        description: 'A function which serves as a setter for the property, or <code>undefined</code> if there is no setter (accessor descriptors only).'
      },
      {
        type: 'boolean',
        description: 'True if the type of this property descriptor may be changed and if the property may be deleted from the corresponding object.'
      },
      {
        type: 'boolean',
        description: 'True if this property shows up during enumeration of the properties on the corresponding object.'
      },
      {
        type: 'boolean',
        optional: true,
        description: 'True if the result was thrown during the evaluation.'
      },
      {
        optional: true,
        type: 'boolean',
        description: 'True if the property is owned for the object.'
      },
      {
        '$ref': 'RemoteObject',
        optional: true,
        description: 'Property symbol object, if the property is of the <code>symbol</code> type.'
      } ]
    },
    {
      id: 'InternalPropertyDescriptor',
      type: 'object',
      description: 'Object internal property descriptor. This property isn\'t normally visible in JavaScript code.',
      properties: [ { type: 'string', description: 'Conventional property name.' },
        {
          '$ref': 'RemoteObject',
          optional: true,
          description: 'The value associated with the property.'
        } ]
    },
    {
      id: 'CallArgument',
      type: 'object',
      description: 'Represents function call argument. Either remote object id <code>objectId</code>, primitive <code>value</code>, unserializable primitive value or neither of (for undefined) them should be specified.',
      properties: [ { type: 'any', optional: true, description: 'Primitive value.' },
        {
          '$ref': 'UnserializableValue',
          optional: true,
          description: 'Primitive value which can not be JSON-stringified.'
        },
        {
          '$ref': 'RemoteObjectId',
          optional: true,
          description: 'Remote object handle.'
        } ]
    },
    {
      id: 'ExecutionContextId',
      type: 'integer',
      description: 'Id of an execution context.'
    },
    {
      id: 'ExecutionContextDescription',
      type: 'object',
      description: 'Description of an isolated world.',
      properties: [ {
        '$ref': 'ExecutionContextId',
        description: 'Unique id of the execution context. It can be used to specify in which execution context script evaluation should be performed.'
      },
          { type: 'string', description: 'Execution context origin.' },
      {
        type: 'string',
        description: 'Human readable name describing given context.'
      },
      {
        type: 'object',
        optional: true,
        description: 'Embedder-specific auxiliary data.'
      } ]
    },
    {
      id: 'ExceptionDetails',
      type: 'object',
      description: 'Detailed information about exception (or error) that was thrown during script compilation or execution.',
      properties: [ { type: 'integer', description: 'Exception id.' },
        {
          type: 'string',
          description: 'Exception text, which should be used together with exception object when available.'
        },
        {
          type: 'integer',
          description: 'Line number of the exception location (0-based).'
        },
        {
          type: 'integer',
          description: 'Column number of the exception location (0-based).'
        },
        {
          '$ref': 'ScriptId',
          optional: true,
          description: 'Script ID of the exception location.'
        },
        {
          type: 'string',
          optional: true,
          description: 'URL of the exception location, to be used when the script was not reported.'
        },
        {
          '$ref': 'StackTrace',
          optional: true,
          description: 'JavaScript stack trace if available.'
        },
        {
          '$ref': 'RemoteObject',
          optional: true,
          description: 'Exception object if available.'
        },
        {
          '$ref': 'ExecutionContextId',
          optional: true,
          description: 'Identifier of the context where exception happened.'
        } ]
    },
    {
      id: 'Timestamp',
      type: 'number',
      description: 'Number of milliseconds since epoch.'
    },
    {
      id: 'CallFrame',
      type: 'object',
      description: 'Stack entry for runtime errors and assertions.',
      properties: [ { type: 'string', description: 'JavaScript function name.' },
          { '$ref': 'ScriptId', description: 'JavaScript script id.' },
        {
          type: 'string',
          description: 'JavaScript script name or url.'
        },
        {
          type: 'integer',
          description: 'JavaScript script line number (0-based).'
        },
        {
          type: 'integer',
          description: 'JavaScript script column number (0-based).'
        } ]
    },
    {
      id: 'StackTrace',
      type: 'object',
      description: 'Call frames for assertions or error messages.',
      properties: [ {
        type: 'string',
        optional: true,
        description: 'String label of this stack trace. For async traces this may be a name of the function that initiated the async call.'
      },
      {
        type: 'array',
        items: { '$ref': 'CallFrame' },
        description: 'JavaScript function name.'
      },
      {
        '$ref': 'StackTrace',
        optional: true,
        description: 'Asynchronous JavaScript stack trace that preceded this stack, if available.'
      },
      {
        '$ref': 'CallFrame',
        optional: true,
        experimental: true,
        description: 'Creation frame of the Promise which produced the next synchronous trace when resolved, if available.'
      } ]
    } ],
    commands: [ {
      name: 'evaluate',
      parameters: [ { type: 'string', description: 'Expression to evaluate.' },
        {
          type: 'string',
          optional: true,
          description: 'Symbolic group name that can be used to release multiple objects.'
        },
        {
          type: 'boolean',
          optional: true,
          description: 'Determines whether Command Line API should be available during the evaluation.'
        },
        {
          type: 'boolean',
          optional: true,
          description: 'In silent mode exceptions thrown during evaluation are not reported and do not pause execution. Overrides <code>setPauseOnException</code> state.'
        },
        {
          '$ref': 'ExecutionContextId',
          optional: true,
          description: 'Specifies in which execution context to perform evaluation. If the parameter is omitted the evaluation will be performed in the context of the inspected page.'
        },
        {
          type: 'boolean',
          optional: true,
          description: 'Whether the result is expected to be a JSON object that should be sent by value.'
        },
        {
          type: 'boolean',
          optional: true,
          experimental: true,
          description: 'Whether preview should be generated for the result.'
        },
        {
          type: 'boolean',
          optional: true,
          experimental: true,
          description: 'Whether execution should be treated as initiated by user in the UI.'
        },
        {
          type: 'boolean',
          optional: true,
          description: 'Whether execution should wait for promise to be resolved. If the result of evaluation is not a Promise, it\'s considered to be an error.'
        } ],
      returns: [ {
        name: 'result',
        '$ref': 'RemoteObject',
        description: 'Evaluation result.'
      },
      {
        name: 'exceptionDetails',
        '$ref': 'ExceptionDetails',
        optional: true,
        description: 'Exception details.'
      } ],
      description: 'Evaluates expression on global object.'
    },
    {
      name: 'awaitPromise',
      parameters: [ {
        '$ref': 'RemoteObjectId',
        description: 'Identifier of the promise.'
      },
      {
        type: 'boolean',
        optional: true,
        description: 'Whether the result is expected to be a JSON object that should be sent by value.'
      },
      {
        type: 'boolean',
        optional: true,
        description: 'Whether preview should be generated for the result.'
      } ],
      returns: [ {
        name: 'result',
        '$ref': 'RemoteObject',
        description: 'Promise result. Will contain rejected value if promise was rejected.'
      },
      {
        name: 'exceptionDetails',
        '$ref': 'ExceptionDetails',
        optional: true,
        description: 'Exception details if stack strace is available.'
      } ],
      description: 'Add handler to promise with given promise object id.'
    },
    {
      name: 'callFunctionOn',
      parameters: [ {
        '$ref': 'RemoteObjectId',
        description: 'Identifier of the object to call function on.'
      },
      {
        type: 'string',
        description: 'Declaration of the function to call.'
      },
      {
        type: 'array',
        items: { '$ref': 'CallArgument', description: 'Call argument.' },
        optional: true,
        description: 'Call arguments. All call arguments must belong to the same JavaScript world as the target object.'
      },
      {
        type: 'boolean',
        optional: true,
        description: 'In silent mode exceptions thrown during evaluation are not reported and do not pause execution. Overrides <code>setPauseOnException</code> state.'
      },
      {
        type: 'boolean',
        optional: true,
        description: 'Whether the result is expected to be a JSON object which should be sent by value.'
      },
      {
        type: 'boolean',
        optional: true,
        experimental: true,
        description: 'Whether preview should be generated for the result.'
      },
      {
        type: 'boolean',
        optional: true,
        experimental: true,
        description: 'Whether execution should be treated as initiated by user in the UI.'
      },
      {
        type: 'boolean',
        optional: true,
        description: 'Whether execution should wait for promise to be resolved. If the result of evaluation is not a Promise, it\'s considered to be an error.'
      } ],
      returns: [ {
        name: 'result',
        '$ref': 'RemoteObject',
        description: 'Call result.'
      },
      {
        name: 'exceptionDetails',
        '$ref': 'ExceptionDetails',
        optional: true,
        description: 'Exception details.'
      } ],
      description: 'Calls function with given declaration on the given object. Object group of the result is inherited from the target object.'
    },
    {
      name: 'getProperties',
      parameters: [ {
        '$ref': 'RemoteObjectId',
        description: 'Identifier of the object to return properties for.'
      },
      {
        optional: true,
        type: 'boolean',
        description: 'If true, returns properties belonging only to the element itself, not to its prototype chain.'
      },
      {
        optional: true,
        type: 'boolean',
        description: 'If true, returns accessor properties (with getter/setter) only; internal properties are not returned either.',
        experimental: true
      },
      {
        type: 'boolean',
        optional: true,
        experimental: true,
        description: 'Whether preview should be generated for the results.'
      } ],
      returns: [ {
        name: 'result',
        type: 'array',
        items: { '$ref': 'PropertyDescriptor' },
        description: 'Object properties.'
      },
      {
        name: 'internalProperties',
        optional: true,
        type: 'array',
        items: { '$ref': 'InternalPropertyDescriptor' },
        description: 'Internal object properties (only of the element itself).'
      },
      {
        name: 'exceptionDetails',
        '$ref': 'ExceptionDetails',
        optional: true,
        description: 'Exception details.'
      } ],
      description: 'Returns properties of a given object. Object group of the result is inherited from the target object.'
    },
    {
      name: 'releaseObject',
      parameters: [ {
        '$ref': 'RemoteObjectId',
        description: 'Identifier of the object to release.'
      } ],
      description: 'Releases remote object with given id.'
    },
    {
      name: 'releaseObjectGroup',
      parameters: [ { type: 'string', description: 'Symbolic object group name.' } ],
      description: 'Releases all remote objects that belong to a given group.'
    },
    {
      name: 'runIfWaitingForDebugger',
      description: 'Tells inspected instance to run if it was waiting for debugger to attach.'
    },
    {
      name: 'enable',
      description: 'Enables reporting of execution contexts creation by means of <code>executionContextCreated</code> event. When the reporting gets enabled the event will be sent immediately for each existing execution context.'
    },
    {
      name: 'disable',
      description: 'Disables reporting of execution contexts creation.'
    },
    {
      name: 'discardConsoleEntries',
      description: 'Discards collected exceptions and console API calls.'
    },
    {
      name: 'setCustomObjectFormatterEnabled',
      parameters: [ { type: 'boolean' } ],
      experimental: true
    },
    {
      name: 'compileScript',
      parameters: [ { type: 'string', description: 'Expression to compile.' },
        {
          type: 'string',
          description: 'Source url to be set for the script.'
        },
        {
          type: 'boolean',
          description: 'Specifies whether the compiled script should be persisted.'
        },
        {
          '$ref': 'ExecutionContextId',
          optional: true,
          description: 'Specifies in which execution context to perform script run. If the parameter is omitted the evaluation will be performed in the context of the inspected page.'
        } ],
      returns: [ {
        name: 'scriptId',
        '$ref': 'ScriptId',
        optional: true,
        description: 'Id of the script.'
      },
      {
        name: 'exceptionDetails',
        '$ref': 'ExceptionDetails',
        optional: true,
        description: 'Exception details.'
      } ],
      description: 'Compiles expression.'
    },
    {
      name: 'runScript',
      parameters: [ { '$ref': 'ScriptId', description: 'Id of the script to run.' },
        {
          '$ref': 'ExecutionContextId',
          optional: true,
          description: 'Specifies in which execution context to perform script run. If the parameter is omitted the evaluation will be performed in the context of the inspected page.'
        },
        {
          type: 'string',
          optional: true,
          description: 'Symbolic group name that can be used to release multiple objects.'
        },
        {
          type: 'boolean',
          optional: true,
          description: 'In silent mode exceptions thrown during evaluation are not reported and do not pause execution. Overrides <code>setPauseOnException</code> state.'
        },
        {
          type: 'boolean',
          optional: true,
          description: 'Determines whether Command Line API should be available during the evaluation.'
        },
        {
          type: 'boolean',
          optional: true,
          description: 'Whether the result is expected to be a JSON object which should be sent by value.'
        },
        {
          type: 'boolean',
          optional: true,
          description: 'Whether preview should be generated for the result.'
        },
        {
          type: 'boolean',
          optional: true,
          description: 'Whether execution should wait for promise to be resolved. If the result of evaluation is not a Promise, it\'s considered to be an error.'
        } ],
      returns: [ {
        name: 'result',
        '$ref': 'RemoteObject',
        description: 'Run result.'
      },
      {
        name: 'exceptionDetails',
        '$ref': 'ExceptionDetails',
        optional: true,
        description: 'Exception details.'
      } ],
      description: 'Runs script with given id in a given context.'
    } ],
    events: [ {
      name: 'executionContextCreated',
      parameters: [ {
        '$ref': 'ExecutionContextDescription',
        description: 'A newly created execution contex.'
      } ],
      description: 'Issued when new execution context is created.'
    },
    {
      name: 'executionContextDestroyed',
      parameters: [ {
        '$ref': 'ExecutionContextId',
        description: 'Id of the destroyed context'
      } ],
      description: 'Issued when execution context is destroyed.'
    },
    {
      name: 'executionContextsCleared',
      description: 'Issued when all executionContexts were cleared in browser'
    },
    {
      name: 'exceptionThrown',
      description: 'Issued when exception was thrown and unhandled.',
      parameters: [ {
        '$ref': 'Timestamp',
        description: 'Timestamp of the exception.'
      },
          { '$ref': 'ExceptionDetails' } ]
    },
    {
      name: 'exceptionRevoked',
      description: 'Issued when unhandled exception was revoked.',
      parameters: [ {
        type: 'string',
        description: 'Reason describing why exception was revoked.'
      },
      {
        type: 'integer',
        description: 'The id of revoked exception, as reported in <code>exceptionUnhandled</code>.'
      } ]
    },
    {
      name: 'consoleAPICalled',
      description: 'Issued when console API was called.',
      parameters: [ {
        type: 'string',
        enum: [ 'log',
          'debug',
          'info',
          'error',
          'warning',
          'dir',
          'dirxml',
          'table',
          'trace',
          'clear',
          'startGroup',
          'startGroupCollapsed',
          'endGroup',
          'assert',
          'profile',
          'profileEnd',
          'count',
          'timeEnd' ],
        description: 'Type of the call.'
      },
      {
        type: 'array',
        items: { '$ref': 'RemoteObject' },
        description: 'Call arguments.'
      },
      {
        '$ref': 'ExecutionContextId',
        description: 'Identifier of the context where the call was made.'
      },
          { '$ref': 'Timestamp', description: 'Call timestamp.' },
      {
        '$ref': 'StackTrace',
        optional: true,
        description: 'Stack trace captured when the call was made.'
      } ]
    },
    {
      name: 'inspectRequested',
      description: 'Issued when object should be inspected (for example, as a result of inspect() command line API call).',
      parameters: [ { '$ref': 'RemoteObject' }, { type: 'object' } ]
    } ]
  },
  Debugger: {
    domain: 'Debugger',
    description: 'Debugger domain exposes JavaScript debugging capabilities. It allows setting and removing breakpoints, stepping through execution, exploring stack traces, etc.',
    dependencies: [ 'Runtime' ],
    types: [ {
      id: 'BreakpointId',
      type: 'string',
      description: 'Breakpoint identifier.'
    },
    {
      id: 'CallFrameId',
      type: 'string',
      description: 'Call frame identifier.'
    },
    {
      id: 'Location',
      type: 'object',
      properties: [ {
        '$ref': 'Runtime.ScriptId',
        description: 'Script identifier as reported in the <code>Debugger.scriptParsed</code>.'
      },
      {
        type: 'integer',
        description: 'Line number in the script (0-based).'
      },
      {
        type: 'integer',
        optional: true,
        description: 'Column number in the script (0-based).'
      } ],
      description: 'Location in the source code.'
    },
    {
      id: 'ScriptPosition',
      experimental: true,
      type: 'object',
      properties: [ { type: 'integer' }, { type: 'integer' } ],
      description: 'Location in the source code.'
    },
    {
      id: 'CallFrame',
      type: 'object',
      properties: [ {
        '$ref': 'CallFrameId',
        description: 'Call frame identifier. This identifier is only valid while the virtual machine is paused.'
      },
      {
        type: 'string',
        description: 'Name of the JavaScript function called on this call frame.'
      },
      {
        '$ref': 'Location',
        optional: true,
        experimental: true,
        description: 'Location in the source code.'
      },
      {
        '$ref': 'Location',
        description: 'Location in the source code.'
      },
      {
        type: 'array',
        items: { '$ref': 'Scope' },
        description: 'Scope chain for this call frame.'
      },
      {
        '$ref': 'Runtime.RemoteObject',
        description: '<code>this</code> object for this call frame.'
      },
      {
        '$ref': 'Runtime.RemoteObject',
        optional: true,
        description: 'The value being returned, if the function is at return point.'
      } ],
      description: 'JavaScript call frame. Array of call frames form the call stack.'
    },
    {
      id: 'Scope',
      type: 'object',
      properties: [ {
        type: 'string',
        enum: [ 'global',
          'local',
          'with',
          'closure',
          'catch',
          'block',
          'script',
          'eval',
          'module' ],
        description: 'Scope type.'
      },
      {
        '$ref': 'Runtime.RemoteObject',
        description: 'Object representing the scope. For <code>global</code> and <code>with</code> scopes it represents the actual object; for the rest of the scopes, it is artificial transient object enumerating scope variables as its properties.'
      },
          { type: 'string', optional: true },
      {
        '$ref': 'Location',
        optional: true,
        description: 'Location in the source code where scope starts'
      },
      {
        '$ref': 'Location',
        optional: true,
        description: 'Location in the source code where scope ends'
      } ],
      description: 'Scope description.'
    },
    {
      id: 'SearchMatch',
      type: 'object',
      description: 'Search match for resource.',
      properties: [ {
        type: 'number',
        description: 'Line number in resource content.'
      },
          { type: 'string', description: 'Line with match content.' } ],
      experimental: true
    },
    {
      id: 'BreakLocation',
      type: 'object',
      properties: [ {
        '$ref': 'Runtime.ScriptId',
        description: 'Script identifier as reported in the <code>Debugger.scriptParsed</code>.'
      },
      {
        type: 'integer',
        description: 'Line number in the script (0-based).'
      },
      {
        type: 'integer',
        optional: true,
        description: 'Column number in the script (0-based).'
      },
      {
        type: 'string',
        enum: [ 'debuggerStatement', 'call', 'return' ],
        optional: true
      } ],
      experimental: true
    } ],
    commands: [ {
      name: 'enable',
      description: 'Enables debugger for the given page. Clients should not assume that the debugging has been enabled until the result for this command is received.'
    },
    {
      name: 'disable',
      description: 'Disables debugger for given page.'
    },
    {
      name: 'setBreakpointsActive',
      parameters: [ {
        type: 'boolean',
        description: 'New value for breakpoints active state.'
      } ],
      description: 'Activates / deactivates all breakpoints on the page.'
    },
    {
      name: 'setSkipAllPauses',
      parameters: [ {
        type: 'boolean',
        description: 'New value for skip pauses state.'
      } ],
      description: 'Makes page not interrupt on any pauses (breakpoint, exception, dom exception etc).'
    },
    {
      name: 'setBreakpointByUrl',
      parameters: [ {
        type: 'integer',
        description: 'Line number to set breakpoint at.'
      },
      {
        type: 'string',
        optional: true,
        description: 'URL of the resources to set breakpoint on.'
      },
      {
        type: 'string',
        optional: true,
        description: 'Regex pattern for the URLs of the resources to set breakpoints on. Either <code>url</code> or <code>urlRegex</code> must be specified.'
      },
      {
        type: 'integer',
        optional: true,
        description: 'Offset in the line to set breakpoint at.'
      },
      {
        type: 'string',
        optional: true,
        description: 'Expression to use as a breakpoint condition. When specified, debugger will only stop on the breakpoint if this expression evaluates to true.'
      } ],
      returns: [ {
        name: 'breakpointId',
        '$ref': 'BreakpointId',
        description: 'Id of the created breakpoint for further reference.'
      },
      {
        name: 'locations',
        type: 'array',
        items: { '$ref': 'Location' },
        description: 'List of the locations this breakpoint resolved into upon addition.'
      } ],
      description: 'Sets JavaScript breakpoint at given location specified either by URL or URL regex. Once this command is issued, all existing parsed scripts will have breakpoints resolved and returned in <code>locations</code> property. Further matching script parsing will result in subsequent <code>breakpointResolved</code> events issued. This logical breakpoint will survive page reloads.'
    },
    {
      name: 'setBreakpoint',
      parameters: [ {
        '$ref': 'Location',
        description: 'Location to set breakpoint in.'
      },
      {
        type: 'string',
        optional: true,
        description: 'Expression to use as a breakpoint condition. When specified, debugger will only stop on the breakpoint if this expression evaluates to true.'
      } ],
      returns: [ {
        name: 'breakpointId',
        '$ref': 'BreakpointId',
        description: 'Id of the created breakpoint for further reference.'
      },
      {
        name: 'actualLocation',
        '$ref': 'Location',
        description: 'Location this breakpoint resolved into.'
      } ],
      description: 'Sets JavaScript breakpoint at a given location.'
    },
    {
      name: 'removeBreakpoint',
      parameters: [ { '$ref': 'BreakpointId' } ],
      description: 'Removes JavaScript breakpoint.'
    },
    {
      name: 'getPossibleBreakpoints',
      parameters: [ {
        '$ref': 'Location',
        description: 'Start of range to search possible breakpoint locations in.'
      },
      {
        '$ref': 'Location',
        optional: true,
        description: 'End of range to search possible breakpoint locations in (excluding). When not specifed, end of scripts is used as end of range.'
      },
      {
        type: 'boolean',
        optional: true,
        description: 'Only consider locations which are in the same (non-nested) function as start.'
      } ],
      returns: [ {
        name: 'locations',
        type: 'array',
        items: { '$ref': 'BreakLocation' },
        description: 'List of the possible breakpoint locations.'
      } ],
      description: 'Returns possible locations for breakpoint. scriptId in start and end range locations should be the same.',
      experimental: true
    },
    {
      name: 'continueToLocation',
      parameters: [ { '$ref': 'Location', description: 'Location to continue to.' } ],
      description: 'Continues execution until specific location is reached.'
    },
      { name: 'stepOver', description: 'Steps over the statement.' },
    {
      name: 'stepInto',
      description: 'Steps into the function call.'
    },
    {
      name: 'stepOut',
      description: 'Steps out of the function call.'
    },
    {
      name: 'pause',
      description: 'Stops on the next JavaScript statement.'
    },
    {
      name: 'scheduleStepIntoAsync',
      description: 'Steps into next scheduled async task if any is scheduled before next pause. Returns success when async task is actually scheduled, returns error if no task were scheduled or another scheduleStepIntoAsync was called.',
      experimental: true
    },
      { name: 'resume', description: 'Resumes JavaScript execution.' },
    {
      name: 'searchInContent',
      parameters: [ {
        '$ref': 'Runtime.ScriptId',
        description: 'Id of the script to search in.'
      },
          { type: 'string', description: 'String to search for.' },
      {
        type: 'boolean',
        optional: true,
        description: 'If true, search is case sensitive.'
      },
      {
        type: 'boolean',
        optional: true,
        description: 'If true, treats string parameter as regex.'
      } ],
      returns: [ {
        name: 'result',
        type: 'array',
        items: { '$ref': 'SearchMatch' },
        description: 'List of search matches.'
      } ],
      experimental: true,
      description: 'Searches for given string in script content.'
    },
    {
      name: 'setScriptSource',
      parameters: [ {
        '$ref': 'Runtime.ScriptId',
        description: 'Id of the script to edit.'
      },
          { type: 'string', description: 'New content of the script.' },
      {
        type: 'boolean',
        optional: true,
        description: ' If true the change will not actually be applied. Dry run may be used to get result description without actually modifying the code.'
      } ],
      returns: [ {
        name: 'callFrames',
        type: 'array',
        optional: true,
        items: { '$ref': 'CallFrame' },
        description: 'New stack trace in case editing has happened while VM was stopped.'
      },
      {
        name: 'stackChanged',
        type: 'boolean',
        optional: true,
        description: 'Whether current call stack  was modified after applying the changes.'
      },
      {
        name: 'asyncStackTrace',
        '$ref': 'Runtime.StackTrace',
        optional: true,
        description: 'Async stack trace, if any.'
      },
      {
        name: 'exceptionDetails',
        optional: true,
        '$ref': 'Runtime.ExceptionDetails',
        description: 'Exception details if any.'
      } ],
      description: 'Edits JavaScript source live.'
    },
    {
      name: 'restartFrame',
      parameters: [ {
        '$ref': 'CallFrameId',
        description: 'Call frame identifier to evaluate on.'
      } ],
      returns: [ {
        name: 'callFrames',
        type: 'array',
        items: { '$ref': 'CallFrame' },
        description: 'New stack trace.'
      },
      {
        name: 'asyncStackTrace',
        '$ref': 'Runtime.StackTrace',
        optional: true,
        description: 'Async stack trace, if any.'
      } ],
      description: 'Restarts particular call frame from the beginning.'
    },
    {
      name: 'getScriptSource',
      parameters: [ {
        '$ref': 'Runtime.ScriptId',
        description: 'Id of the script to get source for.'
      } ],
      returns: [ {
        name: 'scriptSource',
        type: 'string',
        description: 'Script source.'
      } ],
      description: 'Returns source for the script with given id.'
    },
    {
      name: 'setPauseOnExceptions',
      parameters: [ {
        type: 'string',
        enum: [ 'none', 'uncaught', 'all' ],
        description: 'Pause on exceptions mode.'
      } ],
      description: 'Defines pause on exceptions state. Can be set to stop on all exceptions, uncaught exceptions or no exceptions. Initial pause on exceptions state is <code>none</code>.'
    },
    {
      name: 'evaluateOnCallFrame',
      parameters: [ {
        '$ref': 'CallFrameId',
        description: 'Call frame identifier to evaluate on.'
      },
          { type: 'string', description: 'Expression to evaluate.' },
      {
        type: 'string',
        optional: true,
        description: 'String object group name to put result into (allows rapid releasing resulting object handles using <code>releaseObjectGroup</code>).'
      },
      {
        type: 'boolean',
        optional: true,
        description: 'Specifies whether command line API should be available to the evaluated expression, defaults to false.'
      },
      {
        type: 'boolean',
        optional: true,
        description: 'In silent mode exceptions thrown during evaluation are not reported and do not pause execution. Overrides <code>setPauseOnException</code> state.'
      },
      {
        type: 'boolean',
        optional: true,
        description: 'Whether the result is expected to be a JSON object that should be sent by value.'
      },
      {
        type: 'boolean',
        optional: true,
        experimental: true,
        description: 'Whether preview should be generated for the result.'
      },
      {
        type: 'boolean',
        optional: true,
        experimental: true,
        description: 'Whether to throw an exception if side effect cannot be ruled out during evaluation.'
      } ],
      returns: [ {
        name: 'result',
        '$ref': 'Runtime.RemoteObject',
        description: 'Object wrapper for the evaluation result.'
      },
      {
        name: 'exceptionDetails',
        '$ref': 'Runtime.ExceptionDetails',
        optional: true,
        description: 'Exception details.'
      } ],
      description: 'Evaluates expression on a given call frame.'
    },
    {
      name: 'setVariableValue',
      parameters: [ {
        type: 'integer',
        description: '0-based number of scope as was listed in scope chain. Only \'local\', \'closure\' and \'catch\' scope types are allowed. Other scopes could be manipulated manually.'
      },
          { type: 'string', description: 'Variable name.' },
      {
        '$ref': 'Runtime.CallArgument',
        description: 'New variable value.'
      },
      {
        '$ref': 'CallFrameId',
        description: 'Id of callframe that holds variable.'
      } ],
      description: 'Changes value of variable in a callframe. Object-based scopes are not supported and must be mutated manually.'
    },
    {
      name: 'setAsyncCallStackDepth',
      parameters: [ {
        type: 'integer',
        description: 'Maximum depth of async call stacks. Setting to <code>0</code> will effectively disable collecting async call stacks (default).'
      } ],
      description: 'Enables or disables async call stacks tracking.'
    },
    {
      name: 'setBlackboxPatterns',
      parameters: [ {
        type: 'array',
        items: { type: 'string' },
        description: 'Array of regexps that will be used to check script url for blackbox state.'
      } ],
      experimental: true,
      description: 'Replace previous blackbox patterns with passed ones. Forces backend to skip stepping/pausing in scripts with url matching one of the patterns. VM will try to leave blackboxed script by performing \'step in\' several times, finally resorting to \'step out\' if unsuccessful.'
    },
    {
      name: 'setBlackboxedRanges',
      parameters: [ { '$ref': 'Runtime.ScriptId', description: 'Id of the script.' },
          { type: 'array', items: { '$ref': 'ScriptPosition' } } ],
      experimental: true,
      description: 'Makes backend skip steps in the script in blackboxed ranges. VM will try leave blacklisted scripts by performing \'step in\' several times, finally resorting to \'step out\' if unsuccessful. Positions array contains positions where blackbox state is changed. First interval isn\'t blackboxed. Array should be sorted.'
    } ],
    events: [ {
      name: 'scriptParsed',
      parameters: [ {
        '$ref': 'Runtime.ScriptId',
        description: 'Identifier of the script parsed.'
      },
      {
        type: 'string',
        description: 'URL or name of the script parsed (if any).'
      },
      {
        type: 'integer',
        description: 'Line offset of the script within the resource with given URL (for script tags).'
      },
      {
        type: 'integer',
        description: 'Column offset of the script within the resource with given URL.'
      },
        { type: 'integer', description: 'Last line of the script.' },
      {
        type: 'integer',
        description: 'Length of the last line of the script.'
      },
      {
        '$ref': 'Runtime.ExecutionContextId',
        description: 'Specifies script creation context.'
      },
        { type: 'string', description: 'Content hash of the script.' },
      {
        type: 'object',
        optional: true,
        description: 'Embedder-specific auxiliary data.'
      },
      {
        type: 'boolean',
        optional: true,
        description: 'True, if this script is generated as a result of the live edit operation.',
        experimental: true
      },
      {
        type: 'string',
        optional: true,
        description: 'URL of source map associated with script (if any).'
      },
      {
        type: 'boolean',
        optional: true,
        description: 'True, if this script has sourceURL.',
        experimental: true
      },
      {
        type: 'boolean',
        optional: true,
        description: 'True, if this script is ES6 module.',
        experimental: true
      },
      {
        type: 'integer',
        optional: true,
        description: 'This script length.',
        experimental: true
      },
      {
        '$ref': 'Runtime.StackTrace',
        optional: true,
        description: 'JavaScript top stack frame of where the script parsed event was triggered if available.',
        experimental: true
      } ],
      description: 'Fired when virtual machine parses script. This event is also fired for all known and uncollected scripts upon enabling debugger.'
    },
    {
      name: 'scriptFailedToParse',
      parameters: [ {
        '$ref': 'Runtime.ScriptId',
        description: 'Identifier of the script parsed.'
      },
      {
        type: 'string',
        description: 'URL or name of the script parsed (if any).'
      },
      {
        type: 'integer',
        description: 'Line offset of the script within the resource with given URL (for script tags).'
      },
      {
        type: 'integer',
        description: 'Column offset of the script within the resource with given URL.'
      },
          { type: 'integer', description: 'Last line of the script.' },
      {
        type: 'integer',
        description: 'Length of the last line of the script.'
      },
      {
        '$ref': 'Runtime.ExecutionContextId',
        description: 'Specifies script creation context.'
      },
          { type: 'string', description: 'Content hash of the script.' },
      {
        type: 'object',
        optional: true,
        description: 'Embedder-specific auxiliary data.'
      },
      {
        type: 'string',
        optional: true,
        description: 'URL of source map associated with script (if any).'
      },
      {
        type: 'boolean',
        optional: true,
        description: 'True, if this script has sourceURL.',
        experimental: true
      },
      {
        type: 'boolean',
        optional: true,
        description: 'True, if this script is ES6 module.',
        experimental: true
      },
      {
        type: 'integer',
        optional: true,
        description: 'This script length.',
        experimental: true
      },
      {
        '$ref': 'Runtime.StackTrace',
        optional: true,
        description: 'JavaScript top stack frame of where the script parsed event was triggered if available.',
        experimental: true
      } ],
      description: 'Fired when virtual machine fails to parse the script.'
    },
    {
      name: 'breakpointResolved',
      parameters: [ {
        '$ref': 'BreakpointId',
        description: 'Breakpoint unique identifier.'
      },
      {
        '$ref': 'Location',
        description: 'Actual breakpoint location.'
      } ],
      description: 'Fired when breakpoint is resolved to an actual script and location.'
    },
    {
      name: 'paused',
      parameters: [ {
        type: 'array',
        items: { '$ref': 'CallFrame' },
        description: 'Call stack the virtual machine stopped on.'
      },
      {
        type: 'string',
        enum: [ 'XHR',
          'DOM',
          'EventListener',
          'exception',
          'assert',
          'debugCommand',
          'promiseRejection',
          'OOM',
          'other',
          'ambiguous' ],
        description: 'Pause reason.'
      },
      {
        type: 'object',
        optional: true,
        description: 'Object containing break-specific auxiliary properties.'
      },
      {
        type: 'array',
        optional: true,
        items: { type: 'string' },
        description: 'Hit breakpoints IDs'
      },
      {
        '$ref': 'Runtime.StackTrace',
        optional: true,
        description: 'Async stack trace, if any.'
      } ],
      description: 'Fired when the virtual machine stopped on breakpoint or exception or any other stop criteria.'
    },
    {
      name: 'resumed',
      description: 'Fired when the virtual machine resumed execution.'
    } ]
  },
  Console: {
    domain: 'Console',
    description: 'This domain is deprecated - use Runtime or Log instead.',
    dependencies: [ 'Runtime' ],
    deprecated: true,
    types: [ {
      id: 'ConsoleMessage',
      type: 'object',
      description: 'Console message.',
      properties: [ {
        type: 'string',
        enum: [ 'xml',
          'javascript',
          'network',
          'console-api',
          'storage',
          'appcache',
          'rendering',
          'security',
          'other',
          'deprecation',
          'worker' ],
        description: 'Message source.'
      },
      {
        type: 'string',
        enum: [ 'log', 'warning', 'error', 'debug', 'info' ],
        description: 'Message severity.'
      },
        { type: 'string', description: 'Message text.' },
      {
        type: 'string',
        optional: true,
        description: 'URL of the message origin.'
      },
      {
        type: 'integer',
        optional: true,
        description: 'Line number in the resource that generated this message (1-based).'
      },
      {
        type: 'integer',
        optional: true,
        description: 'Column number in the resource that generated this message (1-based).'
      } ]
    } ],
    commands: [ {
      name: 'enable',
      description: 'Enables console domain, sends the messages collected so far to the client by means of the <code>messageAdded</code> notification.'
    },
    {
      name: 'disable',
      description: 'Disables console domain, prevents further console messages from being reported to the client.'
    },
      { name: 'clearMessages', description: 'Does nothing.' } ],
    events: [ {
      name: 'messageAdded',
      parameters: [ {
        '$ref': 'ConsoleMessage',
        description: 'Console message that has been added.'
      } ],
      description: 'Issued when new console message is added.'
    } ]
  },
  Profiler: {
    domain: 'Profiler',
    dependencies: [ 'Runtime', 'Debugger' ],
    types: [ {
      id: 'ProfileNode',
      type: 'object',
      description: 'Profile node. Holds callsite information, execution statistics and child nodes.',
      properties: [ { type: 'integer', description: 'Unique id of the node.' },
        {
          '$ref': 'Runtime.CallFrame',
          description: 'Function location.'
        },
        {
          type: 'integer',
          optional: true,
          experimental: true,
          description: 'Number of samples where this node was on top of the call stack.'
        },
        {
          type: 'array',
          items: { type: 'integer' },
          optional: true,
          description: 'Child node ids.'
        },
        {
          type: 'string',
          optional: true,
          description: 'The reason of being not optimized. The function may be deoptimized or marked as don\'t optimize.'
        },
        {
          type: 'array',
          items: { '$ref': 'PositionTickInfo' },
          optional: true,
          experimental: true,
          description: 'An array of source position ticks.'
        } ]
    },
    {
      id: 'Profile',
      type: 'object',
      description: 'Profile.',
      properties: [ {
        type: 'array',
        items: { '$ref': 'ProfileNode' },
        description: 'The list of profile nodes. First item is the root node.'
      },
      {
        type: 'number',
        description: 'Profiling start timestamp in microseconds.'
      },
      {
        type: 'number',
        description: 'Profiling end timestamp in microseconds.'
      },
      {
        optional: true,
        type: 'array',
        items: { type: 'integer' },
        description: 'Ids of samples top nodes.'
      },
      {
        optional: true,
        type: 'array',
        items: { type: 'integer' },
        description: 'Time intervals between adjacent samples in microseconds. The first delta is relative to the profile startTime.'
      } ]
    },
    {
      id: 'PositionTickInfo',
      type: 'object',
      experimental: true,
      description: 'Specifies a number of samples attributed to a certain source position.',
      properties: [ {
        type: 'integer',
        description: 'Source line number (1-based).'
      },
      {
        type: 'integer',
        description: 'Number of samples attributed to the source line.'
      } ]
    },
    {
      id: 'CoverageRange',
      type: 'object',
      description: 'Coverage data for a source range.',
      properties: [ {
        type: 'integer',
        description: 'JavaScript script source offset for the range start.'
      },
      {
        type: 'integer',
        description: 'JavaScript script source offset for the range end.'
      },
      {
        type: 'integer',
        description: 'Collected execution count of the source range.'
      } ],
      experimental: true
    },
    {
      id: 'FunctionCoverage',
      type: 'object',
      description: 'Coverage data for a JavaScript function.',
      properties: [ { type: 'string', description: 'JavaScript function name.' },
        {
          type: 'array',
          items: { '$ref': 'CoverageRange' },
          description: 'Source ranges inside the function with coverage data.'
        } ],
      experimental: true
    },
    {
      id: 'ScriptCoverage',
      type: 'object',
      description: 'Coverage data for a JavaScript script.',
      properties: [ {
        '$ref': 'Runtime.ScriptId',
        description: 'JavaScript script id.'
      },
      {
        type: 'string',
        description: 'JavaScript script name or url.'
      },
      {
        type: 'array',
        items: { '$ref': 'FunctionCoverage' },
        description: 'Functions contained in the script that has coverage data.'
      } ],
      experimental: true
    } ],
    commands: [ { name: 'enable' },
      { name: 'disable' },
      {
        name: 'setSamplingInterval',
        parameters: [ {
          type: 'integer',
          description: 'New sampling interval in microseconds.'
        } ],
        description: 'Changes CPU profiler sampling interval. Must be called before CPU profiles recording started.'
      },
      { name: 'start' },
      {
        name: 'stop',
        returns: [ {
          name: 'profile',
          '$ref': 'Profile',
          description: 'Recorded profile.'
        } ]
      },
      {
        name: 'startPreciseCoverage',
        parameters: [ {
          type: 'boolean',
          optional: true,
          description: 'Collect accurate call counts beyond simple \'covered\' or \'not covered\'.'
        } ],
        description: 'Enable precise code coverage. Coverage data for JavaScript executed before enabling precise code coverage may be incomplete. Enabling prevents running optimized code and resets execution counters.',
        experimental: true
      },
      {
        name: 'stopPreciseCoverage',
        description: 'Disable precise code coverage. Disabling releases unnecessary execution count records and allows executing optimized code.',
        experimental: true
      },
      {
        name: 'takePreciseCoverage',
        returns: [ {
          name: 'result',
          type: 'array',
          items: { '$ref': 'ScriptCoverage' },
          description: 'Coverage data for the current isolate.'
        } ],
        description: 'Collect coverage data for the current isolate, and resets execution counters. Precise code coverage needs to have started.',
        experimental: true
      },
      {
        name: 'getBestEffortCoverage',
        returns: [ {
          name: 'result',
          type: 'array',
          items: { '$ref': 'ScriptCoverage' },
          description: 'Coverage data for the current isolate.'
        } ],
        description: 'Collect coverage data for the current isolate. The coverage data may be incomplete due to garbage collection.',
        experimental: true
      } ],
    events: [ {
      name: 'consoleProfileStarted',
      parameters: [ { type: 'string' },
        {
          '$ref': 'Debugger.Location',
          description: 'Location of console.profile().'
        },
        {
          type: 'string',
          optional: true,
          description: 'Profile title passed as an argument to console.profile().'
        } ],
      description: 'Sent when new profile recodring is started using console.profile() call.'
    },
    {
      name: 'consoleProfileFinished',
      parameters: [ { type: 'string' },
        {
          '$ref': 'Debugger.Location',
          description: 'Location of console.profileEnd().'
        },
          { '$ref': 'Profile' },
        {
          type: 'string',
          optional: true,
          description: 'Profile title passed as an argument to console.profile().'
        } ]
    } ]
  },
  HeapProfiler: {
    domain: 'HeapProfiler',
    dependencies: [ 'Runtime' ],
    experimental: true,
    types: [ {
      id: 'HeapSnapshotObjectId',
      type: 'string',
      description: 'Heap snapshot object id.'
    },
    {
      id: 'SamplingHeapProfileNode',
      type: 'object',
      description: 'Sampling Heap Profile node. Holds callsite information, allocation statistics and child nodes.',
      properties: [ {
        '$ref': 'Runtime.CallFrame',
        description: 'Function location.'
      },
      {
        type: 'number',
        description: 'Allocations size in bytes for the node excluding children.'
      },
      {
        type: 'array',
        items: { '$ref': 'SamplingHeapProfileNode' },
        description: 'Child nodes.'
      } ]
    },
    {
      id: 'SamplingHeapProfile',
      type: 'object',
      description: 'Profile.',
      properties: [ { '$ref': 'SamplingHeapProfileNode' } ]
    } ],
    commands: [ { name: 'enable' },
      { name: 'disable' },
      {
        name: 'startTrackingHeapObjects',
        parameters: [ { type: 'boolean', optional: true } ]
      },
      {
        name: 'stopTrackingHeapObjects',
        parameters: [ {
          type: 'boolean',
          optional: true,
          description: 'If true \'reportHeapSnapshotProgress\' events will be generated while snapshot is being taken when the tracking is stopped.'
        } ]
      },
      {
        name: 'takeHeapSnapshot',
        parameters: [ {
          type: 'boolean',
          optional: true,
          description: 'If true \'reportHeapSnapshotProgress\' events will be generated while snapshot is being taken.'
        } ]
      },
      { name: 'collectGarbage' },
      {
        name: 'getObjectByHeapObjectId',
        parameters: [ { '$ref': 'HeapSnapshotObjectId' },
          {
            type: 'string',
            optional: true,
            description: 'Symbolic group name that can be used to release multiple objects.'
          } ],
        returns: [ {
          name: 'result',
          '$ref': 'Runtime.RemoteObject',
          description: 'Evaluation result.'
        } ]
      },
      {
        name: 'addInspectedHeapObject',
        parameters: [ {
          '$ref': 'HeapSnapshotObjectId',
          description: 'Heap snapshot object id to be accessible by means of $x command line API.'
        } ],
        description: 'Enables console to refer to the node with given id via $x (see Command Line API for more details $x functions).'
      },
      {
        name: 'getHeapObjectId',
        parameters: [ {
          '$ref': 'Runtime.RemoteObjectId',
          description: 'Identifier of the object to get heap object id for.'
        } ],
        returns: [ {
          name: 'heapSnapshotObjectId',
          '$ref': 'HeapSnapshotObjectId',
          description: 'Id of the heap snapshot object corresponding to the passed remote object id.'
        } ]
      },
      {
        name: 'startSampling',
        parameters: [ {
          type: 'number',
          optional: true,
          description: 'Average sample interval in bytes. Poisson distribution is used for the intervals. The default value is 32768 bytes.'
        } ]
      },
      {
        name: 'stopSampling',
        returns: [ {
          name: 'profile',
          '$ref': 'SamplingHeapProfile',
          description: 'Recorded sampling heap profile.'
        } ]
      } ],
    events: [ {
      name: 'addHeapSnapshotChunk',
      parameters: [ { type: 'string' } ]
    },
      { name: 'resetProfiles' },
    {
      name: 'reportHeapSnapshotProgress',
      parameters: [ { type: 'integer' },
          { type: 'integer' },
          { type: 'boolean', optional: true } ]
    },
    {
      name: 'lastSeenObjectId',
      description: 'If heap objects tracking has been started then backend regulary sends a current value for last seen object id and corresponding timestamp. If the were changes in the heap since last event then one or more heapStatsUpdate events will be sent before a new lastSeenObjectId event.',
      parameters: [ { type: 'integer' }, { type: 'number' } ]
    },
    {
      name: 'heapStatsUpdate',
      description: 'If heap objects tracking has been started then backend may send update for one or more fragments',
      parameters: [ {
        type: 'array',
        items: { type: 'integer' },
        description: 'An array of triplets. Each triplet describes a fragment. The first integer is the fragment index, the second integer is a total count of objects for the fragment, the third integer is a total size of the objects for the fragment.'
      } ]
    } ]
  }
}
