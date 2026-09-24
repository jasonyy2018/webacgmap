import os
from fpdf import FPDF

# Paths
SCREENSHOT_DIR = r'C:\Users\jason\.gemini\antigravity\brain\555653a2-dd18-4c3f-adc4-363f1ec71568\screenshots'
OUTPUT_PDF = r'C:\Users\jason\.gemini\antigravity\brain\555653a2-dd18-4c3f-adc4-363f1ec71568\GMAPKDev_Project_Introduction.pdf'
FONT_PATH = r'C:\Windows\Fonts\msyh.ttc'  # Microsoft YaHei

class ProjectPDF(FPDF):
    def header(self):
        # Arial bold 15
        self.set_font('msyh', 'B', 15)
        # Title
        self.cell(0, 10, 'GMAPKDev - 智能地图客户开发系统项目介绍', 0, 1, 'C')
        # Line break
        self.ln(10)

    def footer(self):
        # Position at 1.5 cm from bottom
        self.set_y(-15)
        # Arial italic 8
        self.set_font('msyh', 'I', 8)
        # Page number
        self.cell(0, 10, f'第 {self.page_no()} 页', 0, 0, 'C')

def generate_pdf():
    pdf = ProjectPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    
    # Check if font exists
    if not os.path.exists(FONT_PATH):
        print(f"Font not found at {FONT_PATH}, attempting to use standard font (will not support Chinese).")
        pdf.add_font('msyh', '', 'Arial', uni=True) # Fallback
    else:
        pdf.add_font('msyh', '', FONT_PATH)
        pdf.add_font('msyh', 'B', FONT_PATH)
        pdf.add_font('msyh', 'I', FONT_PATH)

    # Slide 1: Introduction
    pdf.add_page()
    pdf.set_font('msyh', 'B', 16)
    pdf.cell(0, 10, '一、 项目概述', 0, 1)
    pdf.set_font('msyh', '', 12)
    pdf.multi_cell(0, 10, 'GMAPKDev 是一款基于 Google Maps 和 Gemini AI 的智能化客户开发系统。'
                         '系统能够自动从地图中提取潜在客户信息，并通过 AI 深入分析其官方网站，'
                         '获取联系方式、技术栈及业务背景，帮助企业高效获取精准潜客。')
    
    home_img = os.path.join(SCREENSHOT_DIR, '01_home.png')
    if os.path.exists(home_img):
        pdf.image(home_img, x=10, y=pdf.get_y() + 10, w=190)
    
    # Slide 2: Core Features
    pdf.add_page()
    pdf.set_font('msyh', 'B', 16)
    pdf.cell(0, 10, '二、 核心功能展示', 0, 1)
    pdf.set_font('msyh', '', 12)
    pdf.multi_cell(0, 10, '1. 地图精准获客：通过关键词深度搜索 Google Maps。\n'
                         '2. AI 自动分析：Gemini 1.5 Pro 自动抓取并分析潜客官网。\n'
                         '3. 信息聚合看板：玻璃拟态 UI 设计，数据一目了然。')
    
    features_img = os.path.join(SCREENSHOT_DIR, '02_features.png')
    if os.path.exists(features_img):
        pdf.image(features_img, x=10, y=pdf.get_y() + 10, w=190)

    # Slide 3: Search Results
    pdf.add_page()
    pdf.set_font('msyh', 'B', 16)
    pdf.cell(0, 10, '三、 搜索与分析结果', 0, 1)
    pdf.set_font('msyh', '', 12)
    pdf.multi_cell(0, 10, '系统能够实时展示搜索状态，并以结构化列表形式呈现所有提取的数据。'
                         '支持一键导出或深度追踪。')
    
    results_img = os.path.join(SCREENSHOT_DIR, '03_search_results.png')
    if os.path.exists(results_img):
        pdf.image(results_img, x=10, y=pdf.get_y() + 10, w=190)

    # Slide 4: Conclusion
    pdf.add_page()
    pdf.set_font('msyh', 'B', 16)
    pdf.cell(0, 10, '四、 总结', 0, 1)
    pdf.set_font('msyh', '', 12)
    pdf.multi_cell(0, 10, 'GMAPKDev 将地理信息数据与顶尖 AI 能力结合，'
                         '为 B2B 销售与市场人员打造了下一代的智能拓客引擎。')

    pdf.output(OUTPUT_PDF)
    print(f"PDF generated successfully at: {OUTPUT_PDF}")

if __name__ == '__main__':
    generate_pdf()
