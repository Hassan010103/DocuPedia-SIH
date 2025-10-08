"""
Text Preprocessor for Document Priority System
Handles text cleaning, normalization, and feature extraction
"""

import re
import json
from typing import List, Dict, Set
from datetime import datetime

class DocumentPreprocessor:
    def __init__(self, hierarchy_path='data/department_hierarchy.json'):
        """Initialize preprocessor with department hierarchy"""
        self.stop_words = self._load_stop_words()
        
        # Load department hierarchy
        try:
            with open(hierarchy_path, 'r') as f:
                hierarchy = json.load(f)
                self.urgency_keywords = hierarchy.get('urgency_keywords', {})
                self.dept_tags = hierarchy.get('department_tags', {})
        except:
            self.urgency_keywords = {
                'critical': ['emergency', 'critical', 'urgent', 'immediate'],
                'high': ['important', 'soon', 'timely', 'alert'],
                'medium': ['review', 'attention', 'consider'],
                'low': ['information', 'fyi', 'reference']
            }
            self.dept_tags = {}
    
    def _load_stop_words(self) -> Set[str]:
        """Load common stop words"""
        stop_words = {
            'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
            'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
            'to', 'was', 'will', 'with', 'this', 'these', 'those', 'their',
            'them', 'there', 'have', 'had', 'has', 'been', 'being'
        }
        return stop_words
    
    def clean_text(self, text: str) -> str:
        """
        Clean and normalize text
        
        Args:
            text: Raw input text
            
        Returns:
            Cleaned text string
        """
        if not text:
            return ""
        
        # Convert to lowercase
        text = text.lower()
        
        # Remove URLs
        text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', text)
        
        # Remove email addresses
        text = re.sub(r'\S+@\S+', '', text)
        
        # Remove special characters but keep spaces and basic punctuation
        text = re.sub(r'[^a-zA-Z0-9\s.,!?-]', ' ', text)
        
        # Remove extra whitespace
        text = ' '.join(text.split())
        
        return text
    
    def remove_stop_words(self, text: str) -> str:
        """
        Remove stop words from text
        
        Args:
            text: Input text
            
        Returns:
            Text with stop words removed
        """
        words = text.lower().split()
        filtered_words = [word for word in words if word not in self.stop_words]
        return ' '.join(filtered_words)
    
    def extract_urgency_signals(self, text: str) -> Dict[str, any]:
        """
        Extract urgency signals from text
        
        Args:
            text: Document text
            
        Returns:
            Dictionary with urgency level and score
        """
        text_lower = text.lower()
        
        urgency_scores = {
            'critical': 0,
            'high': 0,
            'medium': 0,
            'low': 0
        }
        
        # Count urgency keywords
        for level, keywords in self.urgency_keywords.items():
            for keyword in keywords:
                if keyword in text_lower:
                    urgency_scores[level] += 1
        
        # Determine dominant urgency level
        max_score = max(urgency_scores.values())
        if max_score == 0:
            urgency_level = 'medium'
            urgency_score = 0.5
        else:
            urgency_level = max(urgency_scores, key=urgency_scores.get)
            urgency_score = {
                'critical': 1.0,
                'high': 0.8,
                'medium': 0.5,
                'low': 0.3
            }.get(urgency_level, 0.5)
        
        return {
            'urgency_level': urgency_level,
            'urgency_score': urgency_score,
            'keyword_counts': urgency_scores
        }
    
    def extract_department_mentions(self, text: str) -> List[str]:
        """
        Extract mentioned departments from text
        
        Args:
            text: Document text
            
        Returns:
            List of department names found in text
        """
        mentioned_depts = []
        text_lower = text.lower()
        
        for dept, keywords in self.dept_tags.items():
            for keyword in keywords:
                if keyword in text_lower:
                    if dept not in mentioned_depts:
                        mentioned_depts.append(dept)
                    break
        
        return mentioned_depts
    
    def extract_dates(self, text: str) -> List[str]:
        """
        Extract dates from text
        
        Args:
            text: Document text
            
        Returns:
            List of date strings found
        """
        # Common date patterns
        date_patterns = [
            r'\d{4}-\d{2}-\d{2}',  # YYYY-MM-DD
            r'\d{2}/\d{2}/\d{4}',  # DD/MM/YYYY
            r'\d{2}-\d{2}-\d{4}',  # DD-MM-YYYY
        ]
        
        dates = []
        for pattern in date_patterns:
            matches = re.findall(pattern, text)
            dates.extend(matches)
        
        return dates
    
    def extract_key_phrases(self, text: str, top_n: int = 10) -> List[str]:
        """
        Extract key phrases from text (simple n-gram approach)
        
        Args:
            text: Document text
            top_n: Number of top phrases to return
            
        Returns:
            List of key phrases
        """
        # Clean text
        clean = self.clean_text(text)
        
        # Remove stop words
        no_stops = self.remove_stop_words(clean)
        
        # Extract bigrams and trigrams
        words = no_stops.split()
        phrases = []
        
        # Bigrams
        for i in range(len(words) - 1):
            phrases.append(f"{words[i]} {words[i+1]}")
        
        # Trigrams
        for i in range(len(words) - 2):
            phrases.append(f"{words[i]} {words[i+1]} {words[i+2]}")
        
        # Count frequency
        phrase_counts = {}
        for phrase in phrases:
            phrase_counts[phrase] = phrase_counts.get(phrase, 0) + 1
        
        # Sort by frequency
        sorted_phrases = sorted(phrase_counts.items(), key=lambda x: x[1], reverse=True)
        
        return [phrase for phrase, count in sorted_phrases[:top_n]]
    
    def preprocess_document(self, document: Dict) -> Dict:
        """
        Full preprocessing pipeline for a document
        
        Args:
            document: Document dictionary
            
        Returns:
            Preprocessed document with additional features
        """
        # Extract text content
        content = document.get('content', '')
        title = document.get('title', '')
        full_text = f"{title} {content}"
        
        # Clean text
        clean_content = self.clean_text(full_text)
        
        # Extract features
        urgency_info = self.extract_urgency_signals(full_text)
        mentioned_depts = self.extract_department_mentions(full_text)
        dates = self.extract_dates(full_text)
        key_phrases = self.extract_key_phrases(full_text, top_n=5)
        
        # Create preprocessed document
        preprocessed = {
            **document,
            'cleaned_content': clean_content,
            'content_without_stopwords': self.remove_stop_words(clean_content),
            'extracted_urgency': urgency_info,
            'mentioned_departments': mentioned_depts,
            'extracted_dates': dates,
            'key_phrases': key_phrases,
            'word_count': len(clean_content.split()),
            'preprocessed_at': datetime.now().isoformat()
        }
        
        return preprocessed
    
    def preprocess_batch(self, documents: List[Dict]) -> List[Dict]:
        """
        Preprocess multiple documents
        
        Args:
            documents: List of document dictionaries
            
        Returns:
            List of preprocessed documents
        """
        return [self.preprocess_document(doc) for doc in documents]
    
    def extract_bilingual_features(self, text: str) -> Dict:
        """
        Extract features from bilingual (English + Malayalam) text
        Note: For demo purposes, focuses on English
        
        Args:
            text: Input text
            
        Returns:
            Dictionary with language features
        """
        # Check for non-ASCII characters (potential Malayalam)
        has_non_ascii = bool(re.search(r'[^\x00-\x7F]', text))
        
        # Estimate language mix
        total_chars = len(text)
        ascii_chars = len(re.sub(r'[^\x00-\x7F]', '', text))
        
        english_ratio = ascii_chars / total_chars if total_chars > 0 else 1.0
        
        return {
            'is_bilingual': has_non_ascii,
            'english_ratio': round(english_ratio, 3),
            'malayalam_ratio': round(1 - english_ratio, 3),
            'estimated_primary_language': 'English' if english_ratio > 0.7 else 'Mixed'
        }
    
    def normalize_department_name(self, dept_name: str) -> str:
        """
        Normalize department names to standard format
        
        Args:
            dept_name: Raw department name
            
        Returns:
            Normalized department name
        """
        dept_mapping = {
            'ops': 'Operations',
            'operation': 'Operations',
            'eng': 'Engineering',
            'engg': 'Engineering',
            'maint': 'Maintenance',
            'maintenance': 'Maintenance',
            'proc': 'Procurement',
            'procurement': 'Procurement',
            'hr': 'HR',
            'human resources': 'HR',
            'fin': 'Finance',
            'finance': 'Finance',
            'safety': 'Safety',
            'legal': 'Legal'
        }
        
        dept_lower = dept_name.lower().strip()
        return dept_mapping.get(dept_lower, dept_name.title())