String typedText = "";
Button[][] keyboard;
Button activeButton = null;
ArrayList<Button> overlayButtons = new ArrayList<Button>();
float textOffsetX = 50;
float textOffsetY = 350;
float typedScroll = 0;

void setup() {
  size(900, 400);
  textSize(32);
  
  // Layout with QJXZ combined key
  String[] rows = {
    "ECUPDA",
    "NFBKQG",
    "LRVWMH",
    "IS TO"
  };
  
  // overlays for each letter
  HashMap<Character, char[]> overlays = new HashMap<Character, char[]>();
  overlays.put('A', new char[]{'N','R','T','L'});
  overlays.put('B', new char[]{'E','R','A','O'});
  overlays.put('C', new char[]{'H','O','A','E'});
  overlays.put('D', new char[]{'E','I','A','O'});
  overlays.put('E', new char[]{'R','S','N','D'});
  overlays.put('F', new char[]{'R','O','A','I'});
  overlays.put('G', new char[]{'R','A','E','U'});
  overlays.put('H', new char[]{'E','A','I','O'});
  overlays.put('I', new char[]{'N','T','S','C'});
  overlays.put('K', new char[]{'E','I','A','O'});
  overlays.put('L', new char[]{'E','I','A','O'});
  overlays.put('M', new char[]{'A','E','I','O'});
  overlays.put('N', new char[]{'G','D','T','C'});
  overlays.put('O', new char[]{'N','R','U','L'});
  overlays.put('P', new char[]{'R','L','A','E'});
  overlays.put('Q', new char[]{'Q','J','X','Z'}); // ✅ QJXZ overlay
  overlays.put('R', new char[]{'E','A','I','O'});
  overlays.put('S', new char[]{'T','H','E','A'});
  overlays.put('T', new char[]{'H','R','O','E'});
  overlays.put('U', new char[]{'R','N','S','T'});
  overlays.put('V', new char[]{'E','I','A','O'});
  overlays.put('W', new char[]{'H','A','E','O'});
  overlays.put('Y', new char[]{'O','E','A','I'});

  keyboard = new Button[4][];
  float startY = 50;
  float keyHeight = 60;
  
  for (int r = 0; r < rows.length; r++) {
    String row = rows[r];
    keyboard[r] = new Button[row.length()];
    float totalWidth = 0;
    for (int i = 0; i < row.length(); i++) {
      char letter = row.charAt(i);
      if (letter == ' ') totalWidth += 120;
      else if (letter == 'Q') totalWidth += 90; // wider QJXZ key
      else totalWidth += 60;
    }
    float startX = (width - totalWidth) / 2;
    float xPos = startX;
    for (int c = 0; c < row.length(); c++) {
      char letter = row.charAt(c);
      float keyWidth = (letter == ' ') ? 120 : (letter == 'Q' ? 90 : 60);
      String label = (letter == ' ') ? "SPACE" : (letter == 'Q' ? "QJXZ" : ""+letter);
      char[] keyOverlays = overlays.get(letter);
      keyboard[r][c] = new Button(xPos, startY + r*keyHeight, keyWidth, keyHeight, label, letter, keyOverlays);
      xPos += keyWidth;
    }
  }
}

void draw() {
  background(255);
  
  fill(0);
  textAlign(LEFT, CENTER);
  
  float textWidthNow = textWidth(typedText);
  if (textWidthNow > width - textOffsetX*2) {
    typedScroll = textWidthNow - (width - textOffsetX*2);
  }
  text(typedText, textOffsetX - typedScroll, textOffsetY);
  
  for (int r = 0; r < keyboard.length; r++) {
    for (int c = 0; c < keyboard[r].length; c++) {
      keyboard[r][c].display(false);
    }
  }
  
  for (Button b : overlayButtons) b.display(true);
}

void mousePressed() {
  boolean clickedOverlay = false;
  for (Button b : overlayButtons) {
    if (b.isMouseOver()) {
      typedText += b.letter;
      setupOverlay(b);
      clickedOverlay = true;
      break;
    }
  }
  
  if (!clickedOverlay) {
    for (int r = 0; r < keyboard.length; r++) {
      for (int c = 0; c < keyboard[r].length; c++) {
        if (keyboard[r][c].isMouseOver()) {
          Button b = keyboard[r][c];
          if (b.letter == ' ') typedText += " ";
          else typedText += b.letter;
          setupOverlay(b);
          return;
        }
      }
    }
  }
}

// --- setupOverlay ---
// Create overlay buttons near the key with gentle spacing.
void setupOverlay(Button b) {
  overlayButtons.clear();
  activeButton = b;
  if (b.overlays == null) return;
  
  float spacing = 5;
  float size = 55;
  
  if (b.overlays.length > 0)
    overlayButtons.add(new Button(b.x + b.w/2 - size/2, b.y - size - spacing, size, size, ""+b.overlays[0], b.overlays[0], null));
  if (b.overlays.length > 1)
    overlayButtons.add(new Button(b.x + b.w/2 - size/2, b.y + b.h + spacing, size, size, ""+b.overlays[1], b.overlays[1], null));
  if (b.overlays.length > 2)
    overlayButtons.add(new Button(b.x - size - spacing, b.y + b.h/2 - size/2, size, size, ""+b.overlays[2], b.overlays[2], null));
  if (b.overlays.length > 3)
    overlayButtons.add(new Button(b.x + b.w + spacing, b.y + b.h/2 - size/2, size, size, ""+b.overlays[3], b.overlays[3], null));
}

// --- mouseMoved ---
// Only clears overlay when mouse leaves the active key + overlay area with buffer.
void mouseMoved() {
  if (activeButton == null) return;
  
  boolean overZone = false;
  
  // Check overlay and key
  if (activeButton.isMouseOver()) overZone = true;
  for (Button b : overlayButtons) if (b.isMouseOver()) overZone = true;
  
  // Add a small buffer region (10px) around overlay area
  float minX = activeButton.x - 15;
  float maxX = activeButton.x + activeButton.w + 15;
  float minY = activeButton.y - 15;
  float maxY = activeButton.y + activeButton.h + 15;
  for (Button b : overlayButtons) {
    minX = min(minX, b.x - 15);
    maxX = max(maxX, b.x + b.w + 15);
    minY = min(minY, b.y - 15);
    maxY = max(maxY, b.y + b.h + 15);
  }
  
  if (mouseX < minX || mouseX > maxX || mouseY < minY || mouseY > maxY) {
    overlayButtons.clear();
    activeButton = null;
  }
}

class Button {
  float x, y, w, h;
  String label;
  char letter;
  char[] overlays;
  
  Button(float x, float y, float w, float h, String label, char letter, char[] overlays) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.label = label;
    this.letter = letter;
    this.overlays = overlays;
  }
  
  void display(boolean isOverlay) {
    if (isOverlay) fill(180, 160, 255); // overlay color
    else fill(isMouseOver() ? 150 : 200);
    rect(x, y, w, h, 10);
    fill(0);
    textAlign(CENTER, CENTER);
    text(label, x + w/2, y + h/2);
  }
  
  boolean isMouseOver() {
    return mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h;
  }
}
