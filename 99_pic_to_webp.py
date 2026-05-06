# 將 jpg 卡牌壓縮並轉 webp 
import os
from PIL import Image

# --- 設定 ---
INPUT_DIR = r'D:\Hex\SideProject\ParkingLT\img\timeIcon'        # 輸入資料夾
OUTPUT_DIR = r'D:\Hex\SideProject\ParkingLT\img\timeIcon\webp'  # 輸出資料夾
MAX_WIDTH = 600
QUALITY = 75

def convert_cards():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    valid_extensions = {'.jpg', '.jpeg', '.png'}
    files = [f for f in os.listdir(INPUT_DIR) if os.path.splitext(f)[1].lower() in valid_extensions]
    
    print(f"🔮 找到 {len(files)} 張卡牌，開始轉為 WebP...")

    for filename in files:
        try:
            input_path = os.path.join(INPUT_DIR, filename)
            
            # 檔名改為 .webp
            file_root = os.path.splitext(filename)[0]
            output_filename = f"{file_root}.webp"
            output_path = os.path.join(OUTPUT_DIR, output_filename)

            with Image.open(input_path) as img:
                if img.mode in ("RGBA", "P"):
                    img = img.convert("RGB")

                w, h = img.size
                if w > MAX_WIDTH:
                    ratio = MAX_WIDTH / w
                    new_h = int(h * ratio)
                    img = img.resize((MAX_WIDTH, new_h), Image.Resampling.LANCZOS)

                img.save(output_path, 'WEBP', quality=QUALITY, optimize=True)
                print(f"   ok: {output_filename}")

        except Exception as e:
            print(f"   ❌ 錯誤 {filename}: {e}")

    print("-" * 30)
    print(f"✨ 圖片轉檔完成！，前往{OUTPUT_DIR}查看轉檔結果")

if __name__ == "__main__":
    convert_cards()