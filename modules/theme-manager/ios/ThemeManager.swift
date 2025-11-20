let K_AAPP_THEME = "K_AAPP_THEME"
let K_AAPP_PALETTE = "K_AAPP_PALETTE"

extension Notification.Name {
  static let RCTUserInterfaceStyleDidChange = Notification.Name("RCTUserInterfaceStyleDidChangeNotification")
}

class ThemeManager: HybridThemeManagerSpec {
  private var listeners: [(ThemeManagerPayload) -> Void] = []
  
  override init() {
    super.init()
    
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(notify),
      name: .RCTUserInterfaceStyleDidChange,
      object: nil
    )
  }
  
  deinit {
    NotificationCenter.default.removeObserver(self, name: .RCTUserInterfaceStyleDidChange, object: nil)
  }
  
  var theme: Theme {
    let ft = fullTheme
    
    if (ft == .auto) {
      return UIScreen.main.traitCollection.userInterfaceStyle == .dark ? .dark : .light
    }
    
    return Theme(fromString: ft.stringValue) ?? .light
  }
  
  var palette: Palette {
    let p = UserDefaults.standard.string(forKey: K_AAPP_PALETTE) ?? "Default"
    
    return Palette(fromString: p) ?? .default
  }
  
  var fullTheme: FullTheme {
    let ft = UserDefaults.standard.string(forKey: K_AAPP_THEME) ?? "Auto"
    
    return FullTheme(fromString: ft) ?? .auto
  }
  
  func setTheme(theme: FullTheme) throws {
    UserDefaults.standard.set(theme.stringValue, forKey: K_AAPP_THEME)
    notify()
  }
  
  func setPalette(palette: Palette) throws {
    UserDefaults.standard.set(palette.stringValue, forKey: K_AAPP_PALETTE)
    notify()
  }
  
  func listen(callback: @escaping (ThemeManagerPayload) -> Void) throws {
    listeners.append(callback)
  }
  
  @objc
  func notify() {
    let payload = ThemeManagerPayload(theme: theme, palette: palette, fullTheme: fullTheme)
    
    for l in listeners { l(payload) }
  }
}
