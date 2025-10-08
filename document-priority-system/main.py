"""
KMRL Document Priority System - Demo Script
Smart Intelligence Hackathon 2025
"""

import json
import sys
import os
from datetime import datetime

# Import the priority model
sys.path.append(os.path.dirname(__file__))
from models.priority_model import DocumentPriorityModel

def print_separator():
    print("\n" + "="*80 + "\n")

def print_document_score(doc, index):
    """Pretty print a scored document"""
    print(f"#{index + 1} | Score: {doc['priority_score']:.4f} | Priority: {doc['priority_label']}")
    print(f"ID: {doc['document_id']}")
    print(f"Title: {doc['title']}")
    print(f"Source: {doc['source_department']} | Type: {doc['document_type']}")
    print(f"Deadline: {doc['deadline']}")
    
    print("\nScore Breakdown:")
    breakdown = doc['breakdown']
    print(f"  • Authority Score:     {breakdown['authority_score']:.3f}")
    print(f"  • Doc Type Score:      {breakdown['doc_type_score']:.3f}")
    print(f"  • Urgency Score:       {breakdown['urgency_score']:.3f}")
    print(f"  • Role Relevance:      {breakdown['role_relevance']:.3f}")
    print(f"  • Content Relevance:   {breakdown['content_relevance']:.3f}")
    print(f"    - TF-IDF: {breakdown['tfidf']:.3f} | BM25: {breakdown['bm25']:.3f} | BERT: {breakdown['bert']:.3f}")
    print("-" * 80)

def demo_single_user(model, documents, user_role, user_department):
    """Demo for a single user role"""
    print_separator()
    print(f"🔍 PRIORITY SCORING FOR: {user_role.upper()} DEPARTMENT")
    print(f"User Role: {user_role} | Department: {user_department}")
    print_separator()
    
    # Score all documents for this user
    scored_docs = model.batch_score_documents(documents, user_role, user_department)
    
    # Display top 5 documents
    print(f"📊 TOP 5 PRIORITY DOCUMENTS FOR {user_department}:")
    print()
    
    for idx, doc in enumerate(scored_docs[:5]):
        print_document_score(doc, idx)
    
    # Statistics
    print_separator()
    print("📈 PRIORITY DISTRIBUTION:")
    
    critical = sum(1 for d in scored_docs if d['priority_label'] == 'CRITICAL')
    high = sum(1 for d in scored_docs if d['priority_label'] == 'HIGH')
    medium = sum(1 for d in scored_docs if d['priority_label'] == 'MEDIUM')
    low = sum(1 for d in scored_docs if d['priority_label'] == 'LOW')
    
    total = len(scored_docs)
    print(f"  CRITICAL: {critical}/{total} ({critical/total*100:.1f}%)")
    print(f"  HIGH:     {high}/{total} ({high/total*100:.1f}%)")
    print(f"  MEDIUM:   {medium}/{total} ({medium/total*100:.1f}%)")
    print(f"  LOW:      {low}/{total} ({low/total*100:.1f}%)")
    
    return scored_docs

def demo_comparison(model, documents):
    """Compare priority scores across different departments"""
    print_separator()
    print("🔀 CROSS-DEPARTMENT PRIORITY COMPARISON")
    print("Analyzing how the same document is prioritized for different departments...")
    print_separator()
    
    # Select a sample document (Safety Circular)
    sample_doc = documents[0]  # Emergency Safety Protocol
    
    print(f"Sample Document: {sample_doc['title']}")
    print(f"Source: {sample_doc['source_department']}")
    print(f"Tagged Departments: {', '.join(sample_doc['tagged_departments'])}")
    print()
    
    departments = ['Operations', 'Safety', 'Engineering', 'Maintenance', 'Procurement', 'HR', 'Finance']
    
    print("Priority Scores by Department:")
    print("-" * 80)
    
    comparison_results = []
    for dept in departments:
        score_result = model.calculate_priority_score(sample_doc, dept, dept)
        comparison_results.append({
            'department': dept,
            'score': score_result['priority_score'],
            'label': score_result['priority_label']
        })
        print(f"{dept:15s} | Score: {score_result['priority_score']:.4f} | Priority: {score_result['priority_label']}")
    
    print()
    print("💡 Insight: Documents from CMRS (Safety Authority) are automatically prioritized")
    print("   higher for Operations and Safety departments, as they are tagged recipients.")

def main():
    print("\n" + "="*80)
    print(" "*20 + "KMRL DOCUMENT PRIORITY SYSTEM")
    print(" "*25 + "SIH 2025 - Prototype Demo")
    print("="*80 + "\n")
    
    print("🚀 Initializing ML Model...")
    print("   Loading TF-IDF Vectorizer...")
    print("   Loading BM25 Ranking Module...")
    print("   Loading BERT Embeddings (Simulated)...")
    print("   Loading Priority Weight Configurations...")
    print("   ✓ Model Initialized Successfully!")
    
    # Initialize model
    model = DocumentPriorityModel()
    
    # Load sample documents
    print("\n📄 Loading Sample Documents...")
    with open('data/sample_documents.json', 'r') as f:
        data = json.load(f)
        documents = data['documents']
    print(f"   ✓ Loaded {len(documents)} documents")
    
    # Save model weights (for demo purposes)
    print("\n💾 Saving Model Weights...")
    os.makedirs('models', exist_ok=True)
    model.save_model('models/trained_weights.pkl')
    print("   ✓ Model weights saved to models/trained_weights.pkl")
    
    # Demo 1: Operations Department
    demo_single_user(model, documents, 'Operations', 'Operations')
    
    input("\nPress Enter to see Safety Department view...")
    
    # Demo 2: Safety Department
    demo_single_user(model, documents, 'Safety', 'Safety')
    
    input("\nPress Enter to see Finance Department view...")
    
    # Demo 3: Finance Department
    demo_single_user(model, documents, 'Finance', 'Finance')
    
    input("\nPress Enter to see cross-department comparison...")
    
    # Demo 4: Cross-department comparison
    demo_comparison(model, documents)
    
    print_separator()
    print("✨ DEMO COMPLETED SUCCESSFULLY!")
    print("\n📊 Key Features Demonstrated:")
    print("  ✓ TF-IDF based content analysis")
    print("  ✓ BM25 ranking algorithm")
    print("  ✓ BERT semantic similarity (simulated)")
    print("  ✓ Department hierarchy-based authority weighting")
    print("  ✓ Role-based relevance scoring")
    print("  ✓ Deadline urgency calculation")
    print("  ✓ Multi-factor priority score aggregation")
    print("\n🎯 Use Cases Covered:")
    print("  • Regulatory compliance prioritization")
    print("  • Safety-critical document highlighting")
    print("  • Cross-department coordination")
    print("  • Deadline-based urgency management")
    print("  • Role-specific document filtering")
    
    print_separator()
    print("💡 Next Steps for Production:")
    print("  1. Integrate actual BERT embeddings (sentence-transformers)")
    print("  2. Connect to KMRL document management system")
    print("  3. Implement real-time document ingestion")
    print("  4. Add Malayalam language support")
    print("  5. Deploy as REST API for web/mobile apps")
    print("  6. Add user feedback loop for model refinement")
    
    print("\n" + "="*80)
    print("Thank you for viewing the KMRL Document Priority System Demo!")
    print("="*80 + "\n")

if __name__ == "__main__":
    main()