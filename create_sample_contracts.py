import os
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def create_sample_contracts():
    output_dir = Path("sample_contracts")
    output_dir.mkdir(parents=True, exist_ok=True)

    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#1e293b"),
        alignment=1, # Center
        spaceAfter=15
    )
    
    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Heading2'],
        fontSize=13,
        leading=16,
        textColor=colors.HexColor("#334155"),
        spaceBefore=12,
        spaceAfter=6
    )
    
    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#334155"),
        spaceAfter=8
    )

    # 1. Enterprise SaaS & Vendor SLA Agreement (High Risk)
    pdf1_path = output_dir / "Enterprise_SaaS_Vendor_Agreement.pdf"
    doc1 = SimpleDocTemplate(str(pdf1_path), pagesize=letter, leftMargin=50, rightMargin=50, topMargin=50, bottomMargin=50)
    story1 = [
        Paragraph("MASTER SERVICES & SOFTWARE-AS-A-SERVICE (SaaS) AGREEMENT", title_style),
        HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#4f46e5"), spaceAfter=15),
        Paragraph("This Master Services Agreement ('Agreement') is entered into as of January 15, 2026, by and between <b>CloudCore Solutions Inc.</b> ('Vendor') and <b>Apex Global Enterprise LLC</b> ('Client').", body_style),
        Spacer(1, 8),
        Paragraph("Section 1. Scope of Services & Cloud SLA", h2_style),
        Paragraph("Vendor agrees to provide enterprise cloud infrastructure, API processing services, and guaranteed 99.9% uptime uptime in accordance with Schedule A attached hereto.", body_style),
        Paragraph("Section 2. Unlimited Indemnification & Damages Trap", h2_style),
        Paragraph("Client shall defend, indemnify, and hold harmless Vendor and its affiliates from and against any and all losses, claims, damages, and legal expenses arising out of any use of the platform. Vendor shall have NO cap on Client liability, and Client assumes unlimited financial liability for third-party indirect, consequential, and punitive damages.", body_style),
        Paragraph("Section 3. Immediate Termination for Convenience", h2_style),
        Paragraph("Vendor reserves the right to terminate this agreement immediately at any time without cause and without prior written notice. Upon termination, all client access will be revoked within 24 hours without refund of prepaid service fees.", body_style),
        Paragraph("Section 4. Intellectual Property & Work Product", h2_style),
        Paragraph("All custom software modifications, integrations, analytical models, and proprietary workflows created by either party during the term of this Agreement shall become the sole and exclusive property of Vendor.", body_style),
        Paragraph("Section 5. Governing Law & Dispute Jurisdiction", h2_style),
        Paragraph("This Agreement shall be governed by, and construed in accordance with, the laws of the State of Delaware, United States, without regard to its conflict of law principles. Any dispute shall be resolved through binding arbitration in Wilmington, Delaware.", body_style),
        Spacer(1, 15),
        Paragraph("IN WITNESS WHEREOF, the parties hereto have executed this Agreement by their duly authorized representatives.", body_style),
        Spacer(1, 10),
        Paragraph("<b>Apex Global Enterprise LLC</b>: ______________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <b>CloudCore Solutions Inc.</b>: ______________________", body_style)
    ]
    doc1.build(story1)

    # 2. Mutual Non-Disclosure Agreement (Moderate Risk)
    pdf2_path = output_dir / "Mutual_Non_Disclosure_Agreement_NDA.pdf"
    doc2 = SimpleDocTemplate(str(pdf2_path), pagesize=letter, leftMargin=50, rightMargin=50, topMargin=50, bottomMargin=50)
    story2 = [
        Paragraph("MUTUAL NON-DISCLOSURE & CONFIDENTIALITY AGREEMENT", title_style),
        HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0284c7"), spaceAfter=15),
        Paragraph("This Mutual Non-Disclosure Agreement ('Agreement') is made effective as of March 1, 2026, by and between <b>NovaTech Labs Inc.</b> ('Party A') and <b>Vertex Ventures Corp.</b> ('Party B').", body_style),
        Spacer(1, 8),
        Paragraph("Section 1. Definition of Confidential Information", h2_style),
        Paragraph("'Confidential Information' refers to any proprietary technical, financial, commercial, or operational information disclosed by either party, whether orally or in writing, marked as confidential.", body_style),
        Paragraph("Section 2. Non-Disclosure Obligations & Perpetual Term", h2_style),
        Paragraph("The receiving party agrees to hold and maintain all Confidential Information in strictest confidence and not to disclose it to any third party for a perpetual period of ten (10) years following the termination of this agreement.", body_style),
        Paragraph("Section 3. Non-Solicitation of Personnel", h2_style),
        Paragraph("During the term of this Agreement and for a period of twenty-four (24) months thereafter, neither party shall directly or indirectly solicit, recruit, or hire any employee, contractor, or executive officer of the other party without prior written consent.", body_style),
        Paragraph("Section 4. Return or Destruction of Materials", h2_style),
        Paragraph("Upon written request by the disclosing party, the receiving party shall immediately destroy or return all documents, notes, diagrams, and copies containing Confidential Information within fourteen (14) calendar days.", body_style),
        Paragraph("Section 5. Governing Law", h2_style),
        Paragraph("This Agreement shall be governed under the laws of the State of California, USA. Any legal action arising hereunder shall be filed exclusively in the courts of San Francisco County, California.", body_style),
        Spacer(1, 15),
        Paragraph("<b>NovaTech Labs Inc.</b>: ______________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <b>Vertex Ventures Corp.</b>: ______________________", body_style)
    ]
    doc2.build(story2)

    # 3. Employment & Restrictive Covenant Agreement (Critical Risk)
    pdf3_path = output_dir / "Employment_Agreement_Software_Engineer.pdf"
    doc3 = SimpleDocTemplate(str(pdf3_path), pagesize=letter, leftMargin=50, rightMargin=50, topMargin=50, bottomMargin=50)
    story3 = [
        Paragraph("SENIOR SOFTWARE ENGINEER EMPLOYMENT AGREEMENT", title_style),
        HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#dc2626"), spaceAfter=15),
        Paragraph("This Employment Agreement is entered into between <b>Quantix Financial AI Systems Ltd.</b> ('Employer') and <b>John Doe</b> ('Employee') effective April 1, 2026.", body_style),
        Spacer(1, 8),
        Paragraph("Section 1. Position, Compensation & Duties", h2_style),
        Paragraph("Employee is employed as Senior Software Engineer with a base annual compensation of $145,000 USD, payable bi-weekly subject to standard withholding taxes.", body_style),
        Paragraph("Section 2. Severe 24-Month Nationwide Non-Compete", h2_style),
        Paragraph("Employee covenants that during employment and for a period of two (2) years following separation for any reason, Employee shall NOT engage in, consult for, advise, or be employed by any enterprise worldwide that operates in financial software, machine learning, or automated analytics.", body_style),
        Paragraph("Section 3. Comprehensive IP Assignment & Moral Rights Waiver", h2_style),
        Paragraph("Employee unconditionally assigns to Employer all rights, title, copyright, patents, and inventions conceived or created during or outside working hours using any personal or company computing resources.", body_style),
        Paragraph("Section 4. At-Will Termination & Severance Forfeiture", h2_style),
        Paragraph("Employer may terminate this agreement at any time with or without cause, immediately upon verbal or written notice, without obligation to pay any severance or notice pay.", body_style),
        Paragraph("Section 5. Governing Jurisdiction", h2_style),
        Paragraph("Governed exclusively under the laws of the State of New York, USA. Exclusive forum in New York County.", body_style),
        Spacer(1, 15),
        Paragraph("<b>Employer Signature</b>: ______________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <b>Employee Signature</b>: ______________________", body_style)
    ]
    doc3.build(story3)

    print("Successfully generated 3 realistic Legal Contract PDFs in ./sample_contracts/")

if __name__ == "__main__":
    create_sample_contracts()
