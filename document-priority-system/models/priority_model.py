"""
Document Priority Scoring Model
Combines TF-IDF, BM25, BERT embeddings with Priority Weights
"""

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pickle
import json
from datetime import datetime, timedelta

class DocumentPriorityModel:
    def __init__(self):
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=1000,
            ngram_range=(1, 2),
            stop_words='english'
        )
        
        # Department hierarchy weights
        self.dept_authority_weights = {
            'CMRS': 1.0,  # Commissioner of Metro Rail Safety
            'MoHUA': 0.95,  # Ministry of Housing & Urban Affairs
            'Executive_Directors': 0.9,
            'Operations': 0.8,
            'Engineering': 0.85,
            'Safety': 0.95,
            'Procurement': 0.7,
            'HR': 0.65,
            'Finance': 0.75,
            'Maintenance': 0.8,
            'Legal': 0.85
        }
        
        # Document type urgency multipliers
        self.doc_type_weights = {
            'Safety_Circular': 1.0,
            'Regulatory_Directive': 0.95,
            'Incident_Report': 0.9,
            'Maintenance_Alert': 0.85,
            'Compliance_Notice': 0.9,
            'Board_Minutes': 0.7,
            'Purchase_Order': 0.65,
            'Vendor_Invoice': 0.6,
            'Engineering_Drawing': 0.75,
            'HR_Policy': 0.5,
            'General_Notice': 0.4
        }
        
        # Role-based relevance weights
        self.role_relevance_matrix = {
            'Operations': {
                'Operations': 1.0, 'Maintenance': 0.8, 'Engineering': 0.7,
                'Safety': 0.9, 'Procurement': 0.4, 'HR': 0.3, 'Finance': 0.4
            },
            'Engineering': {
                'Engineering': 1.0, 'Operations': 0.7, 'Maintenance': 0.8,
                'Safety': 0.8, 'Procurement': 0.6, 'HR': 0.2, 'Finance': 0.4
            },
            'Safety': {
                'Safety': 1.0, 'Operations': 0.9, 'Engineering': 0.8,
                'Maintenance': 0.9, 'Procurement': 0.5, 'HR': 0.6, 'Finance': 0.4
            },
            'Maintenance': {
                'Maintenance': 1.0, 'Operations': 0.8, 'Engineering': 0.7,
                'Safety': 0.9, 'Procurement': 0.7, 'HR': 0.2, 'Finance': 0.4
            },
            'Procurement': {
                'Procurement': 1.0, 'Finance': 0.8, 'Engineering': 0.6,
                'Operations': 0.5, 'Maintenance': 0.6, 'HR': 0.3, 'Safety': 0.4
            },
            'HR': {
                'HR': 1.0, 'Operations': 0.4, 'Engineering': 0.3,
                'Maintenance': 0.3, 'Safety': 0.6, 'Procurement': 0.3, 'Finance': 0.5
            },
            'Finance': {
                'Finance': 1.0, 'Procurement': 0.8, 'Operations': 0.5,
                'Engineering': 0.4, 'Maintenance': 0.4, 'HR': 0.5, 'Safety': 0.4
            }
        }
        
        self.is_trained = False
        self.document_embeddings = {}
        
    def calculate_deadline_urgency(self, deadline_str):
        """Calculate urgency based on deadline proximity"""
        if not deadline_str:
            return 0.5  # Default medium urgency
        
        try:
            deadline = datetime.strptime(deadline_str, '%Y-%m-%d')
            days_remaining = (deadline - datetime.now()).days
            
            if days_remaining < 0:
                return 1.0  # Overdue - maximum urgency
            elif days_remaining <= 1:
                return 0.95
            elif days_remaining <= 3:
                return 0.85
            elif days_remaining <= 7:
                return 0.7
            elif days_remaining <= 14:
                return 0.55
            elif days_remaining <= 30:
                return 0.4
            else:
                return 0.25
        except:
            return 0.5
    
    def calculate_bm25_score(self, query, document, k1=1.5, b=0.75):
        """Simplified BM25 scoring"""
        query_terms = query.lower().split()
        doc_terms = document.lower().split()
        doc_length = len(doc_terms)
        avg_doc_length = 500  # Assumed average
        
        score = 0
        for term in query_terms:
            term_freq = doc_terms.count(term)
            if term_freq > 0:
                idf = np.log((1 + 1) / (1 + term_freq))
                numerator = term_freq * (k1 + 1)
                denominator = term_freq + k1 * (1 - b + b * (doc_length / avg_doc_length))
                score += idf * (numerator / denominator)
        
        return min(score / 10, 1.0)  # Normalize to 0-1
    
    def get_bert_similarity(self, query, document):
        """Simulate BERT embedding similarity (for demo purposes)"""
        # In production, you'd use actual BERT embeddings
        # For demo, we'll use a weighted random with TF-IDF influence
        
        query_words = set(query.lower().split())
        doc_words = set(document.lower().split())
        overlap = len(query_words.intersection(doc_words))
        union = len(query_words.union(doc_words))
        
        jaccard = overlap / union if union > 0 else 0
        # Add some randomness to simulate BERT's semantic understanding
        bert_score = 0.6 * jaccard + 0.4 * np.random.uniform(0.3, 0.9)
        
        return min(bert_score, 1.0)
    
    def calculate_priority_score(self, document, user_role, user_department):
        """
        Main scoring function combining all factors
        
        Score = (Authority_Weight × 0.2) + 
                (Doc_Type_Weight × 0.15) + 
                (Deadline_Urgency × 0.25) + 
                (Role_Relevance × 0.2) + 
                (Content_Relevance × 0.2)
        """
        
        # 1. Authority weight
        source_dept = document.get('source_department', 'General')
        authority_score = self.dept_authority_weights.get(source_dept, 0.5)
        
        # 2. Document type weight
        doc_type = document.get('document_type', 'General_Notice')
        doc_type_score = self.doc_type_weights.get(doc_type, 0.5)
        
        # 3. Deadline urgency
        deadline = document.get('deadline', None)
        urgency_score = self.calculate_deadline_urgency(deadline)
        
        # 4. Role relevance (is this document tagged for user's department?)
        tagged_depts = document.get('tagged_departments', [])
        if user_department in tagged_depts:
            role_relevance = 1.0
        else:
            # Calculate cross-department relevance
            relevance_scores = []
            for dept in tagged_depts:
                if user_department in self.role_relevance_matrix:
                    relevance_scores.append(
                        self.role_relevance_matrix[user_department].get(dept, 0.3)
                    )
            role_relevance = max(relevance_scores) if relevance_scores else 0.3
        
        # 5. Content relevance (TF-IDF + BM25 + BERT simulation)
        user_query = document.get('user_query', user_department)
        doc_content = document.get('content', document.get('title', ''))
        
        # TF-IDF similarity (simplified)
        tfidf_score = 0.6  # Simulated for demo
        
        # BM25 score
        bm25_score = self.calculate_bm25_score(user_query, doc_content)
        
        # BERT similarity
        bert_score = self.get_bert_similarity(user_query, doc_content)
        
        # Weighted average of content relevance methods
        content_relevance = (0.3 * tfidf_score + 0.3 * bm25_score + 0.4 * bert_score)
        
        # Final priority score calculation
        priority_score = (
            authority_score * 0.20 +
            doc_type_score * 0.15 +
            urgency_score * 0.25 +
            role_relevance * 0.20 +
            content_relevance * 0.20
        )
        
        # Add urgency boost for high-priority combinations
        if urgency_score > 0.8 and authority_score > 0.85:
            priority_score = min(priority_score * 1.15, 1.0)
        
        # Return detailed breakdown
        return {
            'priority_score': round(priority_score, 4),
            'breakdown': {
                'authority_score': round(authority_score, 3),
                'doc_type_score': round(doc_type_score, 3),
                'urgency_score': round(urgency_score, 3),
                'role_relevance': round(role_relevance, 3),
                'content_relevance': round(content_relevance, 3),
                'tfidf': round(tfidf_score, 3),
                'bm25': round(bm25_score, 3),
                'bert': round(bert_score, 3)
            },
            'priority_label': self._get_priority_label(priority_score)
        }
    
    def _get_priority_label(self, score):
        """Convert numerical score to priority label"""
        if score >= 0.85:
            return 'CRITICAL'
        elif score >= 0.70:
            return 'HIGH'
        elif score >= 0.50:
            return 'MEDIUM'
        elif score >= 0.30:
            return 'LOW'
        else:
            return 'MINIMAL'
    
    def batch_score_documents(self, documents, user_role, user_department):
        """Score multiple documents and return sorted by priority"""
        scored_docs = []
        
        for doc in documents:
            score_result = self.calculate_priority_score(doc, user_role, user_department)
            scored_docs.append({
                'document_id': doc.get('id'),
                'title': doc.get('title'),
                'source_department': doc.get('source_department'),
                'document_type': doc.get('document_type'),
                'deadline': doc.get('deadline'),
                **score_result
            })
        
        # Sort by priority score (descending)
        scored_docs.sort(key=lambda x: x['priority_score'], reverse=True)
        
        return scored_docs
    
    def save_model(self, filepath):
        """Save model weights and configurations"""
        model_data = {
            'dept_authority_weights': self.dept_authority_weights,
            'doc_type_weights': self.doc_type_weights,
            'role_relevance_matrix': self.role_relevance_matrix,
            'is_trained': True
        }
        
        with open(filepath, 'wb') as f:
            pickle.dump(model_data, f)
        
        print(f"Model saved to {filepath}")
    
    def load_model(self, filepath):
        """Load pre-trained model weights"""
        try:
            with open(filepath, 'rb') as f:
                model_data = pickle.load(f)
            
            self.dept_authority_weights = model_data['dept_authority_weights']
            self.doc_type_weights = model_data['doc_type_weights']
            self.role_relevance_matrix = model_data['role_relevance_matrix']
            self.is_trained = model_data['is_trained']
            
            print(f"Model loaded from {filepath}")
        except FileNotFoundError:
            print(f"No saved model found at {filepath}. Using default weights.")