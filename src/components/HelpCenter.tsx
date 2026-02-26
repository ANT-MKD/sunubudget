import React, { useState } from 'react';
import {
  Search,
  MessageCircle,
  Phone,
  Mail,
  Star,
  HelpCircle,
  Book,
  Video,
  FileText,
  Users,
  ExternalLink,
  Send,
  Zap,
  Shield,
  CreditCard,
  PiggyBank,
  BarChart3,
  Trophy,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const HelpCenter: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'faq' | 'resources' | 'contact'>('faq');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactSuccess, setContactSuccess] = useState<string | null>(null);

  const faqItems = [
    {
      category: 'Général',
      icon: HelpCircle,
      questions: [
        {
          question: 'Comment commencer avec SamaBudget ?',
          answer: 'Commencez par ajouter votre première transaction dans l\'onglet "Transactions". Définissez ensuite votre budget mensuel dans les paramètres et créez vos premiers objectifs d\'épargne.'
        },
        {
          question: 'SamaBudget est-il gratuit ?',
          answer: 'Oui, SamaBudget est entièrement gratuit. Toutes les fonctionnalités de base sont disponibles sans frais.'
        },
        {
          question: 'Mes données sont-elles sécurisées ?',
          answer: 'Absolument. Vos données sont stockées localement sur votre appareil et ne sont jamais partagées avec des tiers sans votre consentement explicite.'
        }
      ]
    },
    {
      category: 'Transactions',
      icon: CreditCard,
      questions: [
        {
          question: 'Comment ajouter une transaction ?',
          answer: 'Allez dans l\'onglet "Transactions", cliquez sur "Nouvelle Transaction", choisissez le type (revenu/dépense), entrez le montant, sélectionnez une catégorie et ajoutez une description.'
        },
        {
          question: 'Puis-je modifier une transaction après l\'avoir créée ?',
          answer: 'Oui, vous pouvez modifier ou supprimer vos transactions à tout moment depuis la liste des transactions.'
        },
        {
          question: 'Comment créer une nouvelle catégorie ?',
          answer: 'Dans les paramètres, vous pouvez gérer vos catégories : ajouter, modifier ou supprimer des catégories selon vos besoins.'
        }
      ]
    },
    {
      category: 'Épargne',
      icon: PiggyBank,
      questions: [
        {
          question: 'Comment créer un objectif d\'épargne ?',
          answer: 'Dans l\'onglet "Épargne", cliquez sur "Nouvel Objectif", définissez un titre, un montant cible, une date limite et choisissez une icône.'
        },
        {
          question: 'Comment ajouter de l\'argent à un objectif ?',
          answer: 'Cliquez sur "Gérer" sur votre objectif d\'épargne, puis utilisez le bouton "Ajouter" pour y transférer de l\'argent.'
        },
        {
          question: 'Que se passe-t-il quand j\'atteins mon objectif ?',
          answer: 'Vous recevrez une notification de félicitations et pourrez créer un nouvel objectif ou retirer l\'argent épargné.'
        }
      ]
    },
    {
      category: 'Statistiques',
      icon: BarChart3,
      questions: [
        {
          question: 'Comment lire mes statistiques ?',
          answer: 'Les statistiques montrent vos revenus, dépenses et solde sur différentes périodes. Utilisez les graphiques pour identifier vos habitudes de dépense.'
        },
        {
          question: 'Puis-je exporter mes données ?',
          answer: 'Oui, vous pouvez exporter vos données au format JSON depuis les paramètres pour les sauvegarder ou les analyser ailleurs.'
        }
      ]
    },
    {
      category: 'Gamification',
      icon: Trophy,
      questions: [
        {
          question: 'Comment fonctionnent les défis ?',
          answer: 'Les défis vous encouragent à adopter de bonnes habitudes financières. Terminez-les pour gagner des points et débloquer des badges.'
        },
        {
          question: 'À quoi servent les points et badges ?',
          answer: 'Ils vous motivent à utiliser l\'application régulièrement et à améliorer vos habitudes financières. Plus vous en gagnez, plus votre niveau augmente.'
        }
      ]
    }
  ];

  const resources = [
    {
      title: 'Guide de démarrage rapide',
      description: 'Apprenez les bases de SamaBudget en 5 minutes',
      icon: Book,
      type: 'guide',
      url: '#'
    },
    {
      title: 'Tutoriels vidéo',
      description: 'Regardez nos tutoriels pas à pas',
      icon: Video,
      type: 'video',
      url: '#'
    },
    {
      title: 'Conseils financiers',
      description: 'Articles sur la gestion de budget',
      icon: FileText,
      type: 'article',
      url: '#'
    },
    {
      title: 'Communauté',
      description: 'Rejoignez notre communauté d\'utilisateurs',
      icon: Users,
      type: 'community',
      url: '#'
    }
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      setContactError('Veuillez remplir tous les champs obligatoires (nom, email, message).');
      setContactSuccess(null);
      return;
    }

    // Simuler l'envoi du message
    setContactSuccess('Message envoyé ! Nous vous répondrons dans les plus brefs délais.');
    setContactError(null);
    setContactForm({ name: '', email: '', subject: '', message: '' });
  };

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const filteredFAQ = faqItems.map(category => ({
    ...category,
    questions: category.questions.filter(
      q =>
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <HelpCircle className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Centre d'Aide</h1>
        <p className="text-gray-600">Trouvez des réponses à vos questions et obtenez de l'aide pour utiliser SamaBudget</p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher dans l'aide..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-6 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'faq'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            FAQ
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-6 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'resources'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Book className="w-4 h-4" />
            Ressources
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`px-6 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'contact'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            Contact
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'faq' && (
        <div className="max-w-4xl mx-auto">
          {filteredFAQ.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">Aucun résultat trouvé</h3>
              <p className="text-gray-600">
                Essayez avec d'autres mots-clés ou parcourez les catégories ci-dessous.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredFAQ.map((category) => (
                <div key={category.category} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <category.icon className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">{category.category}</h3>
                        <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full font-medium">
                          {category.questions.length}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {category.questions.map((item, index) => {
                      const itemId = `${category.category}-${index}`;
                      const isExpanded = expandedItems.has(itemId);

                      return (
                        <div key={index} className="px-6 py-4">
                          <button
                            onClick={() => toggleExpanded(itemId)}
                            className="w-full flex items-center justify-between text-left hover:bg-gray-50 p-2 rounded-md transition-colors"
                          >
                            <span className="font-medium text-gray-900 pr-4">{item.question}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            )}
                          </button>
                          {isExpanded && (
                            <div className="mt-4 pl-4 border-l-2 border-blue-200">
                              <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-6 md:grid-cols-2">
            {resources.map((resource, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    <resource.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{resource.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{resource.description}</p>
                    <button className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm">
                      <ExternalLink className="h-4 w-4" />
                      Accéder
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Tips */}
          <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="h-6 w-6 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900">Conseils Rapides</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-sm text-gray-900">Utilisez les catégories</p>
                  <p className="text-sm text-gray-600">
                    Catégorisez vos transactions pour mieux comprendre vos habitudes de dépense.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-sm text-gray-900">Définissez des objectifs réalistes</p>
                  <p className="text-sm text-gray-600">
                    Commencez par de petits objectifs d'épargne pour rester motivé.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-sm text-gray-900">Consultez vos statistiques</p>
                  <p className="text-sm text-gray-600">
                    Analysez régulièrement vos dépenses pour identifier les domaines d'amélioration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'contact' && (
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Contact Form */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Nous Contacter</h3>
              {contactError && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                  {contactError}
                </div>
              )}
              {contactSuccess && (
                <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
                  {contactSuccess}
                </div>
              )}
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Votre nom"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="votre@email.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
                  <input
                    type="text"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Sujet de votre message"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Décrivez votre question ou problème..."
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gray-900 text-white py-3 px-4 rounded-md font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Envoyer le Message
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Autres Moyens de Contact</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Mail className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-sm text-gray-600">support@samabudget.com</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Phone className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium text-gray-900">Téléphone</p>
                      <p className="text-sm text-gray-600">+221 77 123 45 67</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <MessageCircle className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="font-medium text-gray-900">Chat en direct</p>
                      <p className="text-sm text-gray-600">Disponible 9h-18h</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Évaluez SamaBudget</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Votre avis nous aide à améliorer l'application. Laissez-nous une note !
                </p>
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className="text-yellow-400 hover:text-yellow-500 p-1"
                    >
                      <Star className="h-5 w-5 fill-current" />
                    </button>
                  ))}
                </div>
                <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-200 transition-colors">
                  Laisser un Avis
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpCenter;