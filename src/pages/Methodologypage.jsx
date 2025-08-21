import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Difference from '../assets/difference.svg';
import { useEffect } from 'react';
import { usePostHogEvents } from '../utils/posthogEvents';

const MethodologyPage = () => {
  const { trackMethodologyVisited } = usePostHogEvents();

  useEffect(() => {
    const sourceUrl = document.referrer || null;
    trackMethodologyVisited(sourceUrl);
  }, []);

  return (
    <>
      <Navbar />
      <div className="bg-white text-gray-800 w-screen">
        <div className="mx-auto w-[90%] md:w-[80%] px-6 py-12 md:py-16">
          {/* About Section */}
          <div className="mx-auto w-[90%] md:w-[80%] my-8">
            <h2 className="text-3xl font-semibold text-center">The Methodology for Impact Assessment</h2>
            <p className="text-lg text-gray-700 mt-4 text-justify">
              Watershed management programmes primarily seek to optimize for multiple concerns: water access & resilience and economic prosperity. Many approaches exist for impact assessment of watershed programmes. The primary indicator we chose is the increase in Rabi acreage.
              <br /><br />
              This is because:
              <ul className="list-disc list-inside text-left mx-auto max-w-4xl">
                <li>It is an indicator sensitive to water access. I.e. if water access increases it is usually accompanied by an increase in rabi acreage. Presence of water for irrigation during Rabi also probably indicates the availability of water in Kharif season for critical irrigation, therefore indicating water resilience.</li>
                <li>It is also sensitive to economic prosperity, i.e. if economic prosperity increases in a village, it is usually (not always) observable in increase in rabi acreage.</li>
                <li>It is also easily, accurately, and transparently estimated using remote sensing analysis.</li>
              </ul>
              <br />
              It is known that impact assessment is often challenging due to the possibility of multiple confounding factors. These could be geographical differences: rainfall, soil, slope, elevation, tree cover etc. or nature of watershed interventions or many more.
              <br /><br />
              Taking this into account, we have implemented within Jaltol, a workflow for the <em>Difference in Difference</em> approach. The Difference in Difference (DiD) approach is a popular quasi-experimental research methodology used to estimate the causal effect of a specific intervention on an outcome of interest. This approach is particularly useful in observational studies where random assignment is not feasible. The basic premise of DiD is to compare the changes in outcomes over time between a group that is exposed to an intervention (intervention group) and a group that is not (control group).
              <br /><br />
              In this case of Jaltol, this means that the web app allows for comparison between village level rabi acreage between one village where an intervention was implemented (e.g. check dams, farm ponds, farm bunds etc) and another village where no known intervention was implemented.
            </p>
          </div>

          {/* Section divider */}
          <div className="mx-auto w-[90%] md:w-[80%] my-8">
            <div className="border-t border-gray-300"></div>
          </div>

          <div className="mx-auto w-[90%] md:w-[80%] py-6">
            <h2 className="text-3xl font-semibold text-center mb-4">The Difference in Difference Estimator</h2>
              <div className="flex-1">
                <ol className="text-lg text-gray-700 list-decimal list-inside space-y-4">
                  <li>Pre-Intervention Period: Collect data on the outcome {`{rabi acreage}`} of interest for both the intervention and control villages before the intervention is implemented.</li>
                  <li>Post-Intervention Period: Collect similar data {`{rabi acreage}`} for both villages after the intervention.</li>
                </ol>
                <p className="text-lg text-gray-700 mt-4 text-justify">
                  The figure below illustrates the four sets of data collected, P1 and P2 represent the `rabi acreage` in the intervention village before and after intervention and S1 and S2 the `rabi acreage` in the control village during the same time period. The difference between P2 and Q can be said to be the effect of the intervention.
                </p>
                <img src={Difference} alt="DiD Estimator Illustration" className="mt-4 rounded shadow-lg mx-auto w-full max-w-md" />
                <p className="text-lg text-gray-700 mt-4 text-justify">
                  The DiD approach calculates the effect of the intervention by comparing the difference in outcomes between the pre-intervention and post-intervention periods for both villages. Specifically, it involves a two-step differencing process:
                </p>
                <ol className="text-lg text-gray-700 mt-4 list-decimal list-inside space-y-4">
                  <li>First Difference (Time): Calculate the difference in the outcome for each village (intervention and control) from before to after the intervention. This step controls for time effects that affect both villages.</li>
                  <li>Second Difference (Village): Subtract the change observed in the control village from the change observed in the intervention village. This difference in differences is the DiD estimator, which aims to isolate the effect of the intervention by removing factors that affect both villages equally over time.</li>
                </ol>
              </div>
          </div>

          {/* Assumptions and Control Village */}
          <div className="w-full bg-jaltol-blue py-6">
            <div className="mx-auto w-[90%] md:w-[80%]">
              <h2 className="text-2xl font-semibold">Assumptions</h2>
              <p className="text-lg mt-4 text-justify">
                The key assumption behind the DiD approach is the Parallel Trends Assumption. It assumes that, in the absence of the intervention, the outcomes for both the intervention and control villages would have followed parallel paths over time. This means that any difference in the trend of outcomes between the two villages can be attributed to the intervention.
              </p>
            </div>
          </div>

          <div className="w-full bg-jaltol-blue py-6">
            <div className="mx-auto w-[90%] md:w-[80%]">
              <h2 className="text-2xl font-semibold ">Selection of Control Village</h2>
              <p className="text-lg mt-4 text-justify">
                Thus a big component of the methodology is matching each intervention village to its control which is as similar as possible to the intervention village. In Jaltol we have implemented a rudimentary rule, where once a user selects the intervention village, a control village of similar topography is automatically detected from within the vicinity of a 5km radius. Critically this controls for the biggest confounding variable, rainfall. We can safely assume that the long term trend in rainfall in neighbouring villages is relatively similar as compared to two villages located further apart.
              </p>
            </div>
          </div>

          {/* Advantages and Limitations */}
          <div className="w-full bg-white">
            <div className="mx-auto w-[90%] md:w-[80%] py-12 flex flex-col justify-around">
              <div className="lg:w-full mx-auto mb-8 md:mb-0">
              <div className="bg-green-100 shadow-lg rounded-lg p-6">
                <h3 className="text-xl font-semibold text-black flex items-center">
                  <span className="mr-2">✔</span> Advantages
                </h3>
                <ul className="list-disc list-inside text-lg text-gray-700 mt-4">
                  <li>Controls for Confounding: By comparing changes over time between villages, DiD can control for unobserved confounding variables that are constant over time.</li>
                  <li>Flexibility: DiD can be applied to a variety of data types.</li>
                </ul>
              </div>
              </div>
              <div className="lg:w-full mt-10 mx-auto">
              <div className="bg-red-100 shadow-lg rounded-lg p-6">
                <h3 className="text-xl font-semibold text-black flex items-center">
                  <span className="mr-2">⚠️</span> Limitations
                </h3>
                <ul className="list-disc list-inside text-lg text-gray-700 mt-4">
                  <li>Selection of control village: The DiD methodology is only as good as our ability to identify a similar control village. If our control village differs a lot from the intervention village in rainfall or nature of interventions then the comparison is not valid. It is easier to find control villages with similar rainfall since rainfall data is simpler to work with and easier to access. It is harder to know for sure that the control village also didn&apos;t have any similar interventions conducted.</li>
                  <li>The accuracy of the outcome metric {`{rabi acreage}`}: The methodology discussed here also relies on reasonably accurate maps that are sensitive to changes in rabi acreage over time. We discuss the maps we have used on the Maps page.</li>
                </ul>
              </div>
              </div>
              <div className="lg:w-full mx-auto mt-8">
              <p className="text-gray-700 text-center">
                The methodology implemented in Jaltol is not meant to be the final word on impact assessment but instead a reasonably accurate quick assessment tool which can be pointed to regions where more attention or primary data collection is needed for a comprehensive impact assessment.
              </p>
              </div>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
};

export default MethodologyPage;
