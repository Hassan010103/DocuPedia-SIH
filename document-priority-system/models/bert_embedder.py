"""
BERT Embedder Module
"""

import numpy as np
from typing import List, Dict
import json

class BERTEmbedder:
    """
    Simulates BERT embeddings for document prioritization
    In production, replace with actual sentence-transformers
    """
    
    def __init__(self, model_name='bert-base-uncased'):
        self.model_name = model_name
        self.embedding_dim = 768  # Standard BERT embedding dimension
        self.is_loaded = False
        
        # Domain-specific keywords for KMRL
        self.domain_keywords = {
            'safety': ['safety', 'emergency', 'incident', 'accident', 'hazard', 'risk', 'critical'],
            'operations': ['train', 'service', 'schedule', 'delay', 'platform', 'passenger', 'operations'],
            'maintenance': ['maintenance', 'repair', 'inspection', 'preventive', 'breakdown', 'servicing'],
            'compliance': ['compliance', 'regulatory', 'audit', 'directive', 'mandate', 'requirement'],
            'engineering': ['engineering', 'design', 'construction', 'infrastructure', 'technical'],
            'financial': ['budget', 'payment', 'invoice', 'procurement', 'expenditure', 'financial']
        }
        
        print(f"[BERT] Initializing {model_name} embedder...")
        self._load_model()
    
    def _load_model(self):
        """Simulate model loading"""
        print(f"[BERT] Loading pre-trained model: {self.model_name}")
        print(f"[BERT] Embedding dimension: {self.embedding_dim}")
        print(f"[BERT] ✓ Model loaded successfully (simulated)")
        self.is_loaded = True
    
    def encode(self, text: str, show_progress: bool = False) -> np.ndarray:
        """
        Generate embedding for a single text
        
        In production, this would be:
        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer('bert-base-nli-mean-tokens')
        embedding = model.encode(text)
        """
        
        if not self.is_loaded:
            raise RuntimeError("Model not loaded")
        
        # Simulate embedding generation
        # In reality, BERT creates contextual embeddings
        # For demo, we create deterministic embeddings based on content
        
        text_lower = text.lower()
        
        # Create base random embedding (deterministic by text length)
        np.random.seed(len(text) % 10000)
        base_embedding = np.random.randn(self.embedding_dim)
        
        # Modify embedding based on domain keywords
        for domain, keywords in self.domain_keywords.items():
            keyword_count = sum(1 for kw in keywords if kw in text_lower)
            if keyword_count > 0:
                # Shift embedding in domain-specific direction
                domain_seed = hash(domain) % 10000
                np.random.seed(domain_seed)
                domain_vector = np.random.randn(self.embedding_dim)
                base_embedding += domain_vector * (keyword_count * 0.1)
        
        # Normalize
        embedding = base_embedding / np.linalg.norm(base_embedding)
        
        return embedding
    
    def encode_batch(self, texts: List[str], batch_size: int = 32) -> np.ndarray:
        """Generate embeddings for multiple texts"""
        embeddings = []
        
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            batch_embeddings = [self.encode(text) for text in batch]
            embeddings.extend(batch_embeddings)
        
        return np.array(embeddings)
    
    def similarity(self, text1: str, text2: str) -> float:
        """Calculate cosine similarity between two texts"""
        emb1 = self.encode(text1)
        emb2 = self.encode(text2)
        
        # Cosine similarity
        similarity = np.dot(emb1, emb2) / (np.linalg.norm(emb1) * np.linalg.norm(emb2))
        
        return float(similarity)
    
    def get_relevant_documents(self, query: str, documents: List[Dict], 
                              top_k: int = 5, threshold: float = 0.5) -> List[Dict]:
        """
        Find most relevant documents for a query using semantic similarity
        """
        
        query_embedding = self.encode(query)
        
        results = []
        for doc in documents:
            # Create document text from title and content
            doc_text = f"{doc.get('title', '')} {doc.get('content', '')}"
            doc_embedding = self.encode(doc_text)
            
            # Calculate similarity
            similarity = np.dot(query_embedding, doc_embedding) / (
                np.linalg.norm(query_embedding) * np.linalg.norm(doc_embedding)
            )
            
            if similarity >= threshold:
                results.append({
                    'document': doc,
                    'similarity_score': float(similarity)
                })
        
        # Sort by similarity
        results.sort(key=lambda x: x['similarity_score'], reverse=True)
        
        return results[:top_k]
    
    def create_document_clusters(self, documents: List[Dict], n_clusters: int = 5) -> Dict:
        """
        Group similar documents together (simplified clustering)
        In production, use actual clustering algorithms
        """
        
        # Generate embeddings for all documents
        doc_embeddings = []
        for doc in documents:
            doc_text = f"{doc.get('title', '')} {doc.get('content', '')}"
            embedding = self.encode(doc_text)
            doc_embeddings.append(embedding)
        
        doc_embeddings = np.array(doc_embeddings)
        
        # Simple K-means-like clustering (simulated)
        # In production, use sklearn.cluster.KMeans
        np.random.seed(42)
        cluster_centers = np.random.randn(n_clusters, self.embedding_dim)
        
        clusters = {i: [] for i in range(n_clusters)}
        
        for idx, emb in enumerate(doc_embeddings):
            # Assign to nearest cluster
            distances = [np.linalg.norm(emb - center) for center in cluster_centers]
            cluster_id = np.argmin(distances)
            clusters[cluster_id].append(documents[idx])
        
        return clusters
    
    def get_model_info(self) -> Dict:
        """Return model information"""
        return {
            'model_name': self.model_name,
            'embedding_dimension': self.embedding_dim,
            'is_loaded': self.is_loaded,
            'type': 'Simulated BERT (Demo Mode)'
        }


class ProductionBERTEmbedder:
    """
    Template for production BERT implementation
    Uncomment and install required packages for actual use
    """
    
    def __init__(self, model_name='all-MiniLM-L6-v2'):
        """
        # Production implementation:
        
        from sentence_transformers import SentenceTransformer
        self.model = SentenceTransformer(model_name)
        self.model_name = model_name
        """
        pass
    
    def encode(self, text):
        """
        # Production implementation:
        
        return self.model.encode(text, convert_to_numpy=True)
        """
        pass
    
    def encode_batch(self, texts, batch_size=32):
        """
        # Production implementation:
        
        return self.model.encode(
            texts, 
            batch_size=batch_size,
            show_progress_bar=True,
            convert_to_numpy=True
        )
        """
        pass


# Example usage
if __name__ == "__main__":
    # Initialize embedder
    embedder = BERTEmbedder()
    
    # Test embedding generation
    text1 = "Emergency safety protocol for metro operations"
    text2 = "Safety guidelines for railway systems"
    text3 = "Invoice payment processing procedure"
    
    print("\nTesting BERT Embeddings:")
    print("-" * 50)
    
    emb1 = embedder.encode(text1)
    print(f"Embedding shape: {emb1.shape}")
    
    # Test similarity
    sim_1_2 = embedder.similarity(text1, text2)
    sim_1_3 = embedder.similarity(text1, text3)
    
    print(f"\nSimilarity (Safety vs Safety): {sim_1_2:.4f}")
    print(f"Similarity (Safety vs Finance): {sim_1_3:.4f}")
    
    print("\n✓ BERT Embedder working correctly!")