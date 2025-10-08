"""
Scoring Engine
Integrates all scoring components: TF-IDF, BM25, BERT, Priority Weights
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json
from typing import List, Dict
from datetime import datetime
from models.bert_embedder import BERTEmbedder
from utils.preprocessor import DocumentPreprocessor
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

class ScoringEngine:
    def __init__(self, hierarchy_path='data/department_hierarchy.json'):
        """Initialize scoring engine with all components"""
        self.preprocessor = DocumentPreprocessor(hierarchy_path)
        self.bert_embedder = BERTEmbedder()
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=1000,
            ngram_range=(1, 2),
            stop_words='english'
        )
        
        # Load hierarchy data
        try:
            with open(hierarchy_path, 'r') as f:
                self.hierarchy = json.load(f)
        except:
            self.hierarchy = {}
        
        self.document_vectors = {}
    
    def calculate_tfidf_similarity(self, query: str, documents: List[Dict]) -> List[float]:
        """
        Calculate TF-IDF based similarity scores
        
        Args:
            query: Query text
            documents: List of document dictionaries
            
        Returns:
            List of similarity scores
        """
        # Prepare document texts
        doc_texts = [doc.get('content', '') + ' ' + doc.get('title', '') for doc in documents]
        
        # Add query to corpus
        all_texts = [query] + doc_texts
        
        try:
            # Fit and transform
            tfidf_matrix = self.tfidf_vectorizer.fit_transform(all_texts)
            
            # Calculate similarity between query and documents
            query_vector = tfidf_matrix[0:1]
            doc_vectors = tfidf_matrix[1:]
            
            similarities = cosine_similarity(query_vector, doc_vectors)[0]
            
            return similarities.tolist()
        except:
            # Return default scores if TF-IDF fails
            return [0.5] * len(documents)
    
    def calculate_bm25_score(self, query: str, document: str, k1=1.5, b=0.75) -> float:
        """
        Calculate BM25 score
        
        Args:
            query: Query text
            document: Document text
            k1: BM25 parameter
            b: BM25 parameter
            
        Returns:
            BM25 score
        """
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
        
        return min(score / 10, 1.0)
    
    def calculate_content_relevance(self, query: str, document: Dict) -> Dict:
        """
        Calculate content relevance using multiple methods
        
        Args:
            query: Query text
            document: Document dictionary
            
        Returns:
            Dictionary with relevance scores
        """
        doc_content = document.get('content', '') + ' ' + document.get('title', '')
        
        # TF-IDF
        tfidf_scores = self.calculate_tfidf_similarity(query, [document])
        tfidf_score = tfidf_scores[0] if tfidf_scores else 0.5
        
        # BM25
        bm25_score = self.calculate_bm25_score(query, doc_content)
        
        # BERT
        query_emb = self.bert_embedder.encode(query)
        doc_emb = self.bert_embedder.encode(doc_content)
        bert_score = self.bert_embedder.cosine_similarity(query_emb, doc_emb)
        
        # Weighted combination
        content_relevance = (0.3 * tfidf_score + 0.3 * bm25_score + 0.4 * bert_score)
        
        return {
            'tfidf': round(tfidf_score, 4),
            'bm25': round(bm25_score, 4),
            'bert': round(bert_score, 4),
            'combined': round(content_relevance, 4)
        }
    
    def score_document(self, document: Dict, user_profile: Dict) -> Dict:
        """
        Calculate complete priority score for a document
        
        Args:
            document: Document dictionary
            user_profile: User profile with role and department
            
        Returns:
            Scoring results
        """
        from models.priority_model import DocumentPriorityModel
        
        # Initialize priority model
        priority_model = DocumentPriorityModel()
        
        # Create query from user profile
        user_dept = user_profile.get('department', 'Operations')
        user_role = user_profile.get('role', 'Manager')
        query = f"{user_dept} {user_role}"
        
        # Add query to document for processing
        doc_with_query = {**document, 'user_query': query}
        
        # Calculate priority score
        score_result = priority_model.calculate_priority_score(
            doc_with_query,
            user_role,
            user_dept
        )
        
        return score_result
    
    def batch_score_documents(self, documents: List[Dict], user_profile: Dict) -> List[Dict]:
        """
        Score multiple documents
        
        Args:
            documents: List of document dictionaries
            user_profile: User profile
            
        Returns:
            List of scored documents sorted by priority
        """
        scored_docs = []
        
        for doc in documents:
            score_result = self.score_document(doc, user_profile)
            
            scored_doc = {
                'document_id': doc.get('id'),
                'title': doc.get('title'),
                'source_department': doc.get('source_department'),
                'document_type': doc.get('document_type'),
                'deadline': doc.get('deadline'),
                'tagged_departments': doc.get('tagged_departments', []),
                **score_result
            }
            
            scored_docs.append(scored_doc)
        
        # Sort by priority score
        scored_docs.sort(key=lambda x: x['priority_score'], reverse=True)
        
        return scored_docs
    
    def explain_score(self, score_result: Dict) -> str:
        """
        Generate human-readable explanation of score
        
        Args:
            score_result: Scoring result dictionary
            
        Returns:
            Explanation string
        """
        score = score_result['priority_score']
        breakdown = score_result['breakdown']
        label = score_result['priority_label']
        
        explanation = f"Priority: {label} (Score: {score:.2f})\n\n"
        explanation += "Score Breakdown:\n"
        explanation += f"  • Authority Weight: {breakdown['authority_score']:.2f} (20%)\n"
        explanation += f"  • Document Type: {breakdown['doc_type_score']:.2f} (15%)\n"
        explanation += f"  • Deadline Urgency: {breakdown['urgency_score']:.2f} (25%)\n"
        explanation += f"  • Role Relevance: {breakdown['role_relevance']:.2f} (20%)\n"
        explanation += f"  • Content Relevance: {breakdown['content_relevance']:.2f} (20%)\n"
        explanation += f"\nContent Analysis:\n"
        explanation += f"  • TF-IDF: {breakdown['tfidf']:.2f}\n"
        explanation += f"  • BM25: {breakdown['bm25']:.2f}\n"
        explanation += f"  • BERT: {breakdown['bert']:.2f}\n"
        
        return explanation